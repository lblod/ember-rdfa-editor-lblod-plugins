import Controller from '@ember/controller';
import applyDevTools from 'prosemirror-dev-tools';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { EditorState, PNode, SayController } from '@lblod/ember-rdfa-editor';
import { Schema, Plugin } from '@lblod/ember-rdfa-editor';
import {
  em,
  strikethrough,
  strong,
  underline,
  subscript,
  superscript,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  blockRdfaWithConfig,
  docWithConfig,
  hard_break,
  horizontal_rule,
  invisibleRdfaWithConfig,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';
import sampleData from '@lblod/ember-rdfa-editor/config/sample-data';
import {
  tableOfContentsView,
  table_of_contents,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/nodes';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { NodeViewConstructor } from '@lblod/ember-rdfa-editor';
import {
  STRUCTURE_NODES,
  STRUCTURE_SPECS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/structures';
import IntlService from 'ember-intl/services/intl';
import {
  bulletListWithConfig,
  listItemWithConfig,
  listTrackingPlugin,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import {
  codelist,
  codelistView,
  date,
  dateView,
  number,
  numberView,
  textVariableView,
  text_variable,
  personVariableView,
  person_variable,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import { VariableConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/insert-variable-card';
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import {
  osloLocation,
  osloLocationView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import PersonVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/person/insert';
import {
  inlineRdfaWithConfig,
  inlineRdfaWithConfigView,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';

import VisualiserCard from '@lblod/ember-rdfa-editor/components/_private/rdfa-visualiser/visualiser-card';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';
import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import NodeControlsCard from '@lblod/ember-rdfa-editor/components/_private/node-controls/card';
import DocImportedResourceEditorCard from '@lblod/ember-rdfa-editor/components/_private/doc-imported-resource-editor/card';
import ImportedResourceLinkerCard from '@lblod/ember-rdfa-editor/components/_private/imported-resource-linker/card';
import ExternalTripleEditorCard from '@lblod/ember-rdfa-editor/components/_private/external-triple-editor/card';
import RelationshipEditorCard from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/card';
import { documentConfig } from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/configs';
import SnippetListSelect from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list-select';
import {
  CitationPluginConfig,
  citationPlugin,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import {
  editableNodePlugin,
  getActiveEditableNode,
} from '@lblod/ember-rdfa-editor/plugins/editable-node';
import { ComponentLike } from '@glint/template';
import {
  snippetPlaceholder,
  snippetPlaceholderView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet-placeholder';
import {
  snippet,
  snippetView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet';
import { BlockRDFaView } from '@lblod/ember-rdfa-editor/nodes/block-rdfa';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { structureViewWithConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import { RdfaVisualizerConfig } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';

export default class SnippetEditController extends Controller {
  queryParams = ['editableNodes'];

  VisualiserCard = VisualiserCard;
  DebugInfo = DebugInfo;
  AttributeEditor = AttributeEditor;
  SnippetListSelect = SnippetListSelect;
  NodeControlsCard = NodeControlsCard;
  DocImportedResourceEditorCard = DocImportedResourceEditorCard;
  ImportedResourceLinkerCard = ImportedResourceLinkerCard;
  ExternalTripleEditorCard = ExternalTripleEditorCard;
  RelationshipEditorCard = RelationshipEditorCard;

  @tracked editableNodes = true;

  @action
  toggleEditableNodes() {
    this.editableNodes = !this.editableNodes;
  }

  @service declare intl: IntlService;
  @tracked controller?: SayController;
  @tracked citationPlugin = citationPlugin(this.config.citation);

  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
    say: 'https://say.data.gift/ns/',
  };

  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        content:
          'table_of_contents? document_title? ((block|chapter)+|(block|title)+|(block|article)+)',
        rdfaAware: true,
        hasResourceImports: true,
      }),
      paragraph,
      document_title,
      repaired_block: repairedBlockWithConfig({ rdfaAware: true }),

      list_item: listItemWithConfig({
        enableHierarchicalList: true,
      }),
      ordered_list: orderedListWithConfig({
        enableHierarchicalList: true,
      }),
      bullet_list: bulletListWithConfig({
        enableHierarchicalList: true,
      }),
      templateComment,
      placeholder,
      ...tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
      }),
      date: date(this.config.date),
      oslo_location: osloLocation(this.config.location),
      text_variable,
      person_variable,
      number,
      codelist,
      // TODO switch this for using structureWithConfig directly. This is left here for now to show
      // the 'backwards compatible' move away from the article-structure-plugin...
      ...STRUCTURE_NODES,
      heading: headingWithConfig({ rdfaAware: false }),
      blockquote,

      horizontal_rule,
      code_block,

      text,
      image,

      inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
      hard_break,
      block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
      table_of_contents: table_of_contents(this.config.tableOfContents),
      invisible_rdfa: invisibleRdfaWithConfig({ rdfaAware: true }),
      link: link(this.config.link),
      snippet_placeholder: snippetPlaceholder(this.config.snippet),
      snippet: snippet(this.config.snippet),
    },
    marks: {
      em,
      strong,
      underline,
      strikethrough,
      subscript,
      superscript,
      highlight,
      color,
    },
  });

  get codelistOptions() {
    return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
    };
  }

  get variableTypes(): VariableConfig[] {
    return [
      {
        label: 'text',
        component: TextVariableInsertComponent as unknown as ComponentLike,
      },
      {
        label: 'number',
        component: NumberInsertComponent as unknown as ComponentLike,
      },
      {
        label: 'date',
        component: DateInsertVariableComponent as unknown as ComponentLike,
      },
      {
        label: 'codelist',
        component: CodelistInsertComponent as unknown as ComponentLike,
        options: this.codelistOptions,
      },
      {
        label: 'person',
        component: PersonVariableInsertComponent as unknown as ComponentLike,
      },
    ];
  }

  get config() {
    return {
      tableOfContents: [
        {
          nodeHierarchy: [
            'title|chapter|section|subsection|article',
            'structure_header|article_header',
          ],
          scrollContainer: () =>
            document.getElementsByClassName(
              'say-container__main',
            )[0] as HTMLElement,
        },
      ],
      date: {
        formats: [
          {
            label: 'Short Date',
            key: 'short',
            dateFormat: 'dd/MM/yy',
            dateTimeFormat: 'dd/MM/yy HH:mm',
          },
          {
            label: 'Long Date',
            key: 'long',
            dateFormat: 'EEEE dd MMMM yyyy',
            dateTimeFormat: 'PPPPp',
          },
        ],
        allowCustomFormat: true,
      },
      templateVariable: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
        zonalLocationCodelistUri:
          'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
        nonZonalLocationCodelistUri:
          'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
      },
      structures: STRUCTURE_SPECS,
      link: {
        interactive: true,
        rdfaAware: true,
      },
      location: {
        defaultPointUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/geometrie/',
        defaultPlaceUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/plaats/',
        defaultAddressUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/adres/',
        subjectTypesToLinkTo: [BESLUIT('Artikel'), BESLUIT('Besluit')],
      },
      snippet: {
        endpoint: 'https://dev.reglementairebijlagen.lblod.info/sparql',
      },
      worship: {
        endpoint: 'https://data.lblod.info/sparql',
      },
      lmb: {
        endpoint: 'http://localhost/vendor-proxy/query',
      },
      citation: {
        type: 'nodes',
        activeInNode(node: PNode, state: EditorState) {
          return node.type === state.schema.nodes.doc;
        },
        endpoint: 'https://codex.opendata.api.vlaanderen.be:8888/sparql',
      } as CitationPluginConfig,
    };
  }

  get activeNode() {
    if (this.controller) {
      return getActiveEditableNode(this.controller.activeEditorState);
    }
    return;
  }

  @tracked rdfaEditor?: SayController;
  @tracked nodeViews: (
    controller: SayController,
  ) => Record<string, NodeViewConstructor> = (controller) => {
    return {
      table_of_contents: tableOfContentsView(this.config.tableOfContents)(
        controller,
      ),
      link: linkView(this.config.link)(controller),
      date: dateView(this.config.date)(controller),
      text_variable: textVariableView(controller),
      number: numberView(controller),
      codelist: codelistView(controller),
      templateComment: templateCommentView(controller),
      person_variable: personVariableView(controller),
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
      oslo_location: osloLocationView(this.config.location)(controller),
      snippet_placeholder: snippetPlaceholderView(this.config.snippet)(
        controller,
      ),
      snippet: snippetView(this.config.snippet)(controller),
      block_rdfa: (...args: Parameters<NodeViewConstructor>) =>
        new BlockRDFaView(args, controller),
      // This is the only addition needed to move away from article-structure-plugin without other
      // configuration changes
      structure: structureViewWithConfig()(controller),
    };
  };
  @tracked plugins: Plugin[] = [
    firefoxCursorFix(),
    chromeHacksPlugin(),
    ...tablePlugins,
    tableKeymap,
    this.citationPlugin,
    linkPasteHandler(this.schema.nodes.link),
    listTrackingPlugin(),
    editableNodePlugin(),
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
  rdfaEditorInit(controller: SayController) {
    this.controller = controller;
    applyDevTools(controller.mainEditorView);
    const presetContent =
      localStorage.getItem('EDITOR_CONTENT') ?? sampleData.SnippetTemplate;
    controller.initialize(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  get optionGeneratorConfig() {
    return this.controller && documentConfig(this.controller);
  }

  get visualizerConfig(): RdfaVisualizerConfig {
    return {
      displayConfig: {},
    };
  }
}
