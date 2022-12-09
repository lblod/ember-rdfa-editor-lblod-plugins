import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import {
  ProseController,
  WidgetSpec,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
import { Plugin } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import {
  em,
  link,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/marks';
import {
  block_rdfa,
  blockquote,
  bullet_list,
  code_block,
  doc,
  hard_break,
  heading,
  horizontal_rule,
  image,
  inline_rdfa,
  list_item,
  ordered_list,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { NodeViewConstructor } from 'prosemirror-view';
import {
  placeholder,
  placeholderEditing,
  placeholderView,
} from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { service } from '@ember/service';
import importRdfaSnippet from 'dummy/services/import-rdfa-snippet';
import { besluitTypeWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import { importSnippetWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/import-snippet-plugin';
import {
  rdfaDateCardWidget,
  rdfaDateInsertWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';
import { standardTemplateWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin';
import { roadSignRegulationWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';
import { CodeList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-plugins/fetch-data';
import { insertVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/insert-variable-plugin';
import { templateVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-variable-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

const nodes = {
  doc,
  paragraph,

  repaired_block,

  list_item,
  ordered_list,
  bullet_list,
  placeholder,
  ...tableNodes({ tableGroup: 'block', cellContent: 'inline*' }),
  heading,
  blockquote,

  horizontal_rule,
  code_block,

  text,

  image,

  hard_break,
  inline_rdfa,
  block_rdfa,
};
const marks = {
  link,
  em,
  strong,
  underline,
  strikethrough,
};
const dummySchema = new Schema({ nodes, marks });

export default class IndexController extends Controller {
  @service declare importRdfaSnippet: importRdfaSnippet;
  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
  };

  insertVariableWidgetOptions = {
    defaultEndpoint: 'https://dev.roadsigns.lblod.info/sparql',
    variableTypes: [
      'text',
      'number',
      'date',
      'codelist',
      {
        label: 'Dummy Variable',
        fetchSubtypes: () => {
          const codelists = [
            {
              uri: '1',
              label: '1',
            },
            {
              uri: '2',
              label: '2',
            },
            {
              uri: '3',
              label: '3',
            },
          ];
          return codelists;
        },
        template: (endpoint: string, selectedCodelist: CodeList) => `
          <span property="ext:codelist" resource="${
            selectedCodelist.uri ?? ''
          }"></span>
          <span property="dct:type" content="location"></span>
          <span property="dct:source" resource="${endpoint}"></span>
          <span property="ext:content" datatype="xsd:date">
            <span class="mark-highlight-manual">\${${
              selectedCodelist.label ?? ''
            }}</span>
          </span>
        `,
      },
    ],
  };

  @tracked rdfaEditor?: ProseController;
  @tracked nodeViews: Record<string, NodeViewConstructor> = {
    placeholder: placeholderView,
  };
  @tracked plugins: Plugin[] = [placeholderEditing(), tablePlugin];
  @tracked widgets: WidgetSpec[] = [
    tableMenu,
    besluitTypeWidget,
    importSnippetWidget,
    rdfaDateCardWidget,
    rdfaDateInsertWidget,
    standardTemplateWidget,
    roadSignRegulationWidget,
    insertVariableWidget(this.insertVariableWidgetOptions),
    templateVariableWidget,
  ];
  schema: Schema = dummySchema;

  @action
  setPrefixes(element: HTMLElement) {
    element.setAttribute('prefix', this.prefixToAttrString(this.prefixes));
  }

  prefixToAttrString(prefix: Record<string, string>) {
    let attrString = '';
    Object.keys(prefix).forEach((key) => {
      const uri = unwrap(prefix[key]);
      attrString += `${key}: ${uri} `;
    });
    return attrString;
  }

  @action
  async rdfaEditorInit(controller: ProseController) {
    await this.importRdfaSnippet.downloadSnippet({
      omitCredentials: 'true',
      source:
        'https://dev.kleinbord.lblod.info/snippets/example-opstellingen.html',
      mock: 'true',
    });
    const presetContent = `
<div typeof="besluit:BehandelingVanAgendapunt">
    Enter this text with the cursor and try to add a template. This wil appear in place of the cursor leaving this text on screen, but when it works, it works. We could consider adding the RDFa data of this element into the debug component itself.
</div>`;
    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
