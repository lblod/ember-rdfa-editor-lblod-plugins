import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import applyDevTools from 'prosemirror-dev-tools';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { getOwner } from '@ember/application';

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
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { code } from '@lblod/ember-rdfa-editor/plugins/code/marks/code';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { image, imageView } from '@lblod/ember-rdfa-editor/plugins/image';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import {
  inline_rdfa,
  inlineRdfaView,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import {
  link,
  linkPasteHandler,
  linkView,
} from '@lblod/ember-rdfa-editor/plugins/link';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import {
  bullet_list_input_rule,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list/input_rules';
import {
  codelist,
  date,
  number,
  text_variable,
  location,
  textVariableView,
  numberView,
  codelistView,
  locationView,
  address,
  addressView,
  dateView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { inputRules, PluginConfig, Schema } from '@lblod/ember-rdfa-editor';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import {
  editableNodePlugin,
  getActiveEditableNode,
} from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';
import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import RdfaEditor from '@lblod/ember-rdfa-editor/components/_private/rdfa-editor';

import {
  STRUCTURE_NODES,
  STRUCTURE_SPECS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/structures';
import { VariableConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/insert-variable-card';
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import LocationInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/location/insert';
import VariablePluginAddressInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/insert-variable';
import SnippetListSelectRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list-select-rdfa';
import SnippetInsertRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-insert-rdfa';

export default class EditableBlockController extends Controller {
  DebugInfo = DebugInfo;
  AttributeEditor = AttributeEditor;
  RdfaEditor = RdfaEditor;
  SnippetInsert = SnippetInsertRdfaComponent;
  SnippetListSelect = SnippetListSelectRdfaComponent;

  @tracked rdfaEditor?: SayController;
  @service declare intl: IntlService;
  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        content: '((chapter|block)+|(title|block)+|(article|block)+)',
        defaultLanguage: 'nl-BE',
      }),
      paragraph,

      repaired_block,

      list_item,
      ordered_list,
      bullet_list,
      placeholder,
      ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
      heading,
      blockquote,
      text_variable,
      number,
      location,
      date: date(this.dateOptions),
      codelist,
      address,

      horizontal_rule,
      code_block,

      text,

      image,

      hard_break,
      block_rdfa,
      inline_rdfa,
      link: link(this.linkOptions),
      ...STRUCTURE_NODES,
    },
    marks: {
      code,
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

  get linkOptions() {
    return {
      interactive: true,
    };
  }
  get codelistOptions() {
    return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
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
  get locationOptions() {
    return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      zonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
      nonZonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
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
      snippet: {
        endpoint: 'https://dev.reglementairebijlagen.lblod.info/sparql',
      },
    };
  }

  @tracked plugins: PluginConfig = [
    firefoxCursorFix(),
    chromeHacksPlugin(),
    lastKeyPressedPlugin,
    tablePlugin,
    tableKeymap,
    linkPasteHandler(this.schema.nodes.link),
    createInvisiblesPlugin([hardBreak, paragraphInvisible, headingInvisible], {
      shouldShowInvisibles: false,
    }),
    inputRules({
      rules: [
        bullet_list_input_rule(this.schema.nodes.bullet_list),
        ordered_list_input_rule(this.schema.nodes.ordered_list),
      ],
    }),
    emberApplication({ application: getOwner(this) }),
    editableNodePlugin(),
  ];

  @tracked nodeViews = (controller: SayController) => {
    return {
      link: linkView(this.linkOptions)(controller),
      image: imageView(controller),
      inline_rdfa: inlineRdfaView(controller),
      number: numberView(controller),
      text_variable: textVariableView(controller),
      date: dateView(this.dateOptions)(controller),
      codelist: codelistView(controller),
      location: locationView(controller),
      address: addressView(controller),
    };
  };

  get activeNode() {
    if (this.rdfaEditor) {
      return getActiveEditableNode(this.rdfaEditor.activeEditorState);
    }
    return;
  }

  get showRdfaBlocks() {
    return this.rdfaEditor?.showRdfaBlocks;
  }
  get controller() {
    return this.rdfaEditor;
  }

  @action
  rdfaEditorInit(rdfaEditor: SayController) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.initialize(presetContent);
    applyDevTools(rdfaEditor.mainEditorView);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }

  get structureConfig() {
    return STRUCTURE_SPECS;
  }
}
