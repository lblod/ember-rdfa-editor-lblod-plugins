import Controller from '@ember/controller';
import applyDevTools from 'prosemirror-dev-tools';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { SayController } from '@lblod/ember-rdfa-editor';
import { Schema, Plugin } from '@lblod/ember-rdfa-editor';
import {
  em,
  strikethrough,
  strong,
  underline,
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
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';

import { service } from '@ember/service';
import ImportRdfaSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/services/import-rdfa-snippet';
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
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import {
  address,
  addressView,
  codelist,
  codelistView,
  location,
  locationView,
  number,
  numberView,
  textVariableView,
  text_variable,
  personVariableView,
  person_variable,
  autofilled_variable,
  autofilledVariableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { VariableConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/insert-variable-card';
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import { getOwner } from '@ember/application';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import {
  date,
  dateView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/date';
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import PersonVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/person/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import LocationInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/location/insert';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import AutofilledInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/autofilled/insert';
import VariablePluginAddressInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/insert-variable';
import { redacted } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/confidentiality-plugin/marks/redacted';
import {
  inlineRdfaWithConfig,
  inlineRdfaWithConfigView,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';
import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import RdfaEditor from '@lblod/ember-rdfa-editor/components/_private/rdfa-editor';
import SnippetInsertRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-insert-rdfa';
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
import recreateUuidsOnPaste from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/recreateUuidsOnPaste';
import { variableAutofillerPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/plugins/autofiller';
import { BlockRDFaView } from '@lblod/ember-rdfa-editor/nodes/block-rdfa';

export default class RegulatoryStatementSampleController extends Controller {
  SnippetInsert = SnippetInsertRdfaComponent;
  SnippetListSelect = SnippetListSelect;
  DebugInfo = DebugInfo;
  AttributeEditor = AttributeEditor;
  RdfaEditor = RdfaEditor;
  @tracked editableNodes = false;

  @action
  toggleEditableNodes() {
    this.editableNodes = !this.editableNodes;
  }

  @service declare importRdfaSnippet: ImportRdfaSnippet;
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
      }),
      paragraph,
      document_title,

      repaired_block: repairedBlockWithConfig({ rdfaAware: true }),
      list_item: listItemWithConfig({}),
      ordered_list: orderedListWithConfig({}),
      bullet_list: bulletListWithConfig({}),
      templateComment,
      placeholder,
      ...tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
      }),
      address,
      date: date(this.dateOptions),
      text_variable,
      person_variable,
      autofilled_variable,
      number,
      location,
      codelist,
      ...STRUCTURE_NODES,
      heading: headingWithConfig({ rdfaAware: false }),
      blockquote,

      horizontal_rule,
      code_block,

      text,
      image,

      hard_break,
      block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
      table_of_contents: table_of_contents(this.config.tableOfContents),
      invisible_rdfa: invisibleRdfaWithConfig({ rdfaAware: true }),
      inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
      link: link(this.config.link),
      snippet_placeholder: snippetPlaceholder,
      snippet: snippet(this.config.snippet),
    },
    marks: {
      em,
      strong,
      underline,
      strikethrough,
      redacted,
    },
  });

  get codelistOptions() {
    return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
    };
  }

  get locationOptions() {
    return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      zonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
      nonZonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
    };
  }

  get dateOptions() {
    return {
      formats: [
        {
          key: 'short',
          dateFormat: 'dd/MM/yy',
          dateTimeFormat: 'dd/MM/yy HH:mm',
        },
        {
          key: 'long',
          dateFormat: 'EEEE dd MMMM yyyy',
          dateTimeFormat: 'PPPPp',
        },
      ],
      allowCustomFormat: true,
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
        label: 'location',
        component: LocationInsertComponent as unknown as ComponentLike,
        options: this.locationOptions,
      },
      {
        label: 'codelist',
        component: CodelistInsertComponent as unknown as ComponentLike,
        options: this.codelistOptions,
      },
      {
        label: 'address',
        component:
          VariablePluginAddressInsertVariableComponent as unknown as ComponentLike,
      },
      {
        label: 'person',
        component: PersonVariableInsertComponent as unknown as ComponentLike,
      },
      {
        label: 'autofilled',
        component: AutofilledInsertComponent as unknown as ComponentLike,
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
      snippet: {
        allowedContent:
          'document_title? ((block|chapter)+|(block|title)+|(block|article)+)',
        endpoint: 'https://dev.reglementairebijlagen.lblod.info/raw-sparql',
      },
      worship: {
        endpoint: 'https://data.lblod.info/sparql',
      },
      lmb: {
        endpoint: 'http://localhost/vendor-proxy/query',
      },
      citation: {
        type: 'nodes',
        activeInNodeTypes(schema: Schema) {
          return new Set([schema.nodes.doc]);
        },
        endpoint: '/codex/sparql',
      } as CitationPluginConfig,
      autofilledVariable: {
        autofilledValues: {},
      },
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
      date: dateView(this.dateOptions)(controller),
      number: numberView(controller),
      text_variable: textVariableView(controller),
      person_variable: personVariableView(controller),
      location: locationView(controller),
      codelist: codelistView(controller),
      templateComment: templateCommentView(controller),
      address: addressView(controller),
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
      snippet_placeholder: snippetPlaceholderView(controller),
      snippet: snippetView(this.config.snippet)(controller),
      autofilled_variable: autofilledVariableView(controller),
      block_rdfa: (node) => new BlockRDFaView(node),
    };
  };
  @tracked plugins: Plugin[] = [
    firefoxCursorFix(),
    chromeHacksPlugin(),
    lastKeyPressedPlugin,
    tablePlugin,
    tableKeymap,
    linkPasteHandler(this.schema.nodes.link),
    createInvisiblesPlugin([hardBreak, paragraphInvisible, headingInvisible], {
      shouldShowInvisibles: false,
    }),
    emberApplication({ application: getOwner(this) }),
    editableNodePlugin(),
    recreateUuidsOnPaste,
    variableAutofillerPlugin(this.config.autofilledVariable),
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
  async rdfaEditorInit(controller: SayController) {
    this.controller = controller;
    applyDevTools(controller.mainEditorView);
    await this.importRdfaSnippet.downloadSnippet({
      omitCredentials: 'true',
      source:
        'https://dev.kleinbord.lblod.info/snippets/example-opstellingen.html',
      mock: 'true',
    });
    const presetContent =
      localStorage.getItem('EDITOR_CONTENT') ??
      `<div resource='http://localhost/test' typeof='say:DocumentContent'>Insert here</div>`;
    controller.initialize(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
