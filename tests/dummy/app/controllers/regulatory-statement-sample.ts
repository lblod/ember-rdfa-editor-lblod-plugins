import Controller from '@ember/controller';
import applyDevTools from 'prosemirror-dev-tools';
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
  placeholder,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { service } from '@ember/service';
import ImportRdfaSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/services/import-rdfa-snippet';
import {
  rdfaDateCardWidget,
  rdfaDateInsertWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';
import {
  tableOfContentsView,
  tableOfContents,
} from '@lblod/ember-rdfa-editor-lblod-plugins/ember-nodes/table-of-contents';
import { tableOfContentsWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin';
import { CodeList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-plugins/fetch-data';
import { insertVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/insert-variable-plugin';
import { templateVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-variable-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { NodeViewConstructor } from '@lblod/ember-rdfa-editor';
import {
  articleStructureContextWidget,
  // articleStructureContextWidget,
  articleStructureInsertWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { setupCitationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { invisible_rdfa } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { STRUCTURE_NODES } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/structures';
const citation = setupCitationPlugin();
const nodes = {
  doc: {
    content: 'tableOfContents? block+',
  },
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
  ...STRUCTURE_NODES,
  block_rdfa,
  tableOfContents,
  invisible_rdfa,
};
const marks = {
  citation: citation.marks.citation,
  inline_rdfa,
  link,
  em,
  strong,
  underline,
  strikethrough,
};
const dummySchema = new Schema({ nodes, marks });

export default class RegulatoryStatementSampleController extends Controller {
  @service declare importRdfaSnippet: ImportRdfaSnippet;
  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
    say: 'https://say.data.gift/ns/',
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
  @tracked nodeViews: (
    controller: ProseController
  ) => Record<string, NodeViewConstructor> = (controller) => {
    return {
      tableOfContents: tableOfContentsView(controller),
    };
  };
  @tracked plugins: Plugin[] = [tablePlugin, citation.plugin];
  @tracked widgets: WidgetSpec[] = [
    tableMenu,
    rdfaDateCardWidget,
    rdfaDateInsertWidget,
    tableOfContentsWidget(),
    insertVariableWidget(this.insertVariableWidgetOptions),
    templateVariableWidget,
    articleStructureInsertWidget(),
    articleStructureContextWidget(),
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
    applyDevTools(controller.view);
    await this.importRdfaSnippet.downloadSnippet({
      omitCredentials: 'true',
      source:
        'https://dev.kleinbord.lblod.info/snippets/example-opstellingen.html',
      mock: 'true',
    });
    const presetContent = `<div resource='http://localhost/test' typeof='say:DocumentContent'>Insert here</div>`;
    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
