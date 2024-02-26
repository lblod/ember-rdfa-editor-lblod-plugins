import Controller from '@ember/controller';
import applyDevTools from 'prosemirror-dev-tools';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import { SayController } from '@lblod/ember-rdfa-editor';
import { Schema, Plugin } from '@lblod/ember-rdfa-editor';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  block_rdfa,
  docWithConfig,
  hard_break,
  horizontal_rule,
  invisible_rdfa,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';
import { NodeViewConstructor } from '@lblod/ember-rdfa-editor';
import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import {
  inline_rdfa,
  inlineRdfaView,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import {
  editableNodePlugin,
  getActiveEditableNode,
} from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';
import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import RdfaEditor from '@lblod/ember-rdfa-editor/components/_private/rdfa-editor';

import ImportRdfaSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/services/import-rdfa-snippet';
import {
  tableOfContentsView,
  table_of_contents,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/nodes';
import { TableOfContentsConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import {
  STRUCTURE_NODES,
  STRUCTURE_SPECS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/structures';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import {
  codelist,
  codelistView,
  number,
  numberView,
  textVariableView,
  text_variable,
  address,
  addressView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { VariableConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/insert-variable-card';
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import {
  date,
  dateView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/date';
import {
  citationPlugin,
  CitationPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import LocationInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/location/insert';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import VariablePluginAddressInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/insert-variable';
import { redacted } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/confidentiality-plugin/marks/redacted';
import SnippetInsertRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-insert-rdfa';
import SnippetListSelectRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list-select-rdfa';

const SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE = 'data-snippet-list-ids';

export default class RegulatoryStatementSampleController extends Controller {
  DebugInfo = DebugInfo;
  AttributeEditor = AttributeEditor;
  RdfaEditor = RdfaEditor;
  SnippetInsert = SnippetInsertRdfaComponent;
  SnippetListSelect = SnippetListSelectRdfaComponent;

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
        extraAttributes: {
          [SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE]: { default: null },
        },
      }),
      paragraph,
      document_title,
      repaired_block,

      list_item,
      ordered_list,
      bullet_list,
      templateComment,
      placeholder,
      ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
      address,
      date: date(this.dateOptions),
      text_variable,
      number,
      codelist,
      ...STRUCTURE_NODES,
      heading,
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      inline_rdfa,
      hard_break,
      block_rdfa,
      table_of_contents: table_of_contents(this.config.tableOfContents),
      invisible_rdfa,
      link: link(this.config.link),
    },
    marks: {
      em,
      strong,
      underline,
      strikethrough,
      redacted,
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
    };
  }

  get variableTypes(): VariableConfig[] {
    return [
      {
        label: 'text',
        component: TextVariableInsertComponent,
      },
      {
        label: 'number',
        component: NumberInsertComponent,
      },
      {
        label: 'date',
        component: DateInsertVariableComponent,
      },
      {
        label: 'location',
        component: LocationInsertComponent,
        options: this.locationOptions,
      },
      {
        label: 'codelist',
        component: CodelistInsertComponent,
        options: this.codelistOptions,
      },
      {
        label: 'address',
        component: VariablePluginAddressInsertVariableComponent,
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
            document.getElementsByClassName('say-container__main')[0],
        },
      ] as TableOfContentsConfig,
      structures: STRUCTURE_SPECS,
      citation: {
        type: 'nodes',
        activeInNodeTypes(schema: Schema) {
          return new Set([schema.nodes.doc]);
        },
        endpoint: '/codex/sparql',
      } as CitationPluginConfig,
      link: {
        interactive: true,
      },
      snippet: {
        endpoint: 'https://dev.reglementairebijlagen.lblod.info/sparql',
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
      address: addressView(controller),
      date: dateView(this.dateOptions)(controller),
      number: numberView(controller),
      text_variable: textVariableView(controller),
      codelist: codelistView(controller),
      templateComment: templateCommentView(controller),
      inline_rdfa: inlineRdfaView(controller),
    };
  };
  @tracked plugins: Plugin[] = [
    ...tablePlugins,
    tableKeymap,
    this.citationPlugin,
    linkPasteHandler(this.schema.nodes.link),
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
