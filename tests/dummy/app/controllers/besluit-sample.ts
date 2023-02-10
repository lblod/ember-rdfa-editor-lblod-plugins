import Controller from '@ember/controller';
import applyDevTools from 'prosemirror-dev-tools';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import {
  ProseController,
  WidgetSpec,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
import { Schema, Plugin } from '@lblod/ember-rdfa-editor';
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
  placeholder,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { service } from '@ember/service';
import importRdfaSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/services/import-rdfa-snippet';
import { besluitTypeWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import { importSnippetWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/import-snippet-plugin';
import {
  rdfaDateCardWidget,
  rdfaDateInsertWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';
import {
  besluitNodes,
  standardTemplateWidget,
  structureSpecs,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin';
import { roadSignRegulationWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';
import { templateVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { NodeType, NodeViewConstructor } from '@lblod/ember-rdfa-editor';
import { setupCitationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { invisible_rdfa } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import sampleData from '@lblod/ember-rdfa-editor/config/sample-data';
import { date } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin/nodes';
import IntlService from 'ember-intl/services/intl';
import {
  variable,
  variableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/nodes';
import {
  articleStructureContextWidget,
  articleStructureInsertWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { roadsign_regulation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/nodes';
import { besluitPluginCardWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-plugin';
import {
  customRdfaWidget,
  insertCustomRdfaWidget,
  custom_rdfa,
  customRdfaView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/custom-rdfa-plugin';

const citation = setupCitationPlugin({
  type: 'nodes',
  activeInNodeTypes(schema): Set<NodeType> {
    return new Set<NodeType>([schema.nodes.motivering]);
  },
});

export default class BesluitSampleController extends Controller {
  @service declare importRdfaSnippet: importRdfaSnippet;
  @service declare intl: IntlService;
  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
    say: 'https://say.data.gift/ns/',
  };

  get schema() {
    return new Schema({
      nodes: {
        doc,
        paragraph,

        repaired_block,

        list_item,
        ordered_list,
        bullet_list,
        placeholder,
        ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
        date: date({
          placeholder: {
            insertDate: this.intl.t('date-plugin.insert.date'),
            insertDateTime: this.intl.t('date-plugin.insert.datetime'),
          },
        }),
        variable,
        ...besluitNodes,
        roadsign_regulation,
        heading,
        blockquote,

        horizontal_rule,
        code_block,

        text,

        image,

        hard_break,
        block_rdfa,
        invisible_rdfa,
        custom_rdfa,
      },
      marks: {
        citation: citation.marks.citation,
        inline_rdfa,
        link,
        em,
        strong,
        underline,
        strikethrough,
      },
    });
  }

  @tracked rdfaEditor?: ProseController;
  @tracked nodeViews: (
    controller: ProseController
  ) => Record<string, NodeViewConstructor> = (controller) => {
    return {
      variable: variableView(controller),
      custom_rdfa: customRdfaView(controller),
    };
  };
  @tracked plugins: Plugin[] = [tablePlugin, tableKeymap, citation.plugin];
  @tracked widgets: WidgetSpec[] = [
    tableMenu,
    besluitPluginCardWidget,
    besluitTypeWidget,
    importSnippetWidget,
    rdfaDateCardWidget(),
    rdfaDateInsertWidget(),
    standardTemplateWidget,
    citation.widgets.citationCard,
    citation.widgets.citationInsert,
    roadSignRegulationWidget,
    templateVariableWidget,
    articleStructureInsertWidget(structureSpecs),
    articleStructureContextWidget(structureSpecs),
    customRdfaWidget,
    insertCustomRdfaWidget,
  ];

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
    const presetContent =
      localStorage.getItem('EDITOR_CONTENT') ?? sampleData.DecisionTemplate;
    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
