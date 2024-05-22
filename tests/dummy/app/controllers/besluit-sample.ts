import Controller from '@ember/controller';
import applyDevTools from 'prosemirror-dev-tools';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import {
  NodeType,
  NodeViewConstructor,
  Plugin,
  SayController,
  Schema,
} from '@lblod/ember-rdfa-editor';
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
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import {
  bulletListWithConfig,
  listItemWithConfig,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';
import sampleData from '@lblod/ember-rdfa-editor/config/sample-data';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';

import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import importRdfaSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/services/import-rdfa-snippet';
import {
  besluitNodes,
  structureSpecs,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin';
import { roadsign_regulation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/nodes';
import {
  citationPlugin,
  CitationPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import {
  validation,
  ValidationReport,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';
import {
  insertArticleContainer,
  insertDescription,
  insertMotivation,
  insertTitle,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
import { atLeastOneArticleContainer } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/utils/validation-rules';
import {
  codelist,
  number,
  text_variable,
  location,
  textVariableView,
  numberView,
  codelistView,
  locationView,
  address,
  addressView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import {
  date,
  dateView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/date';
import { redacted } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/confidentiality-plugin/marks/redacted';
import {
  inlineRdfaWithConfig,
  inlineRdfaWithConfigView,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import {
  editableNodePlugin,
  getActiveEditableNode,
} from '@lblod/ember-rdfa-editor/plugins/editable-node';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';
import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import RdfaEditor from '@lblod/ember-rdfa-editor/components/_private/rdfa-editor';

export default class BesluitSampleController extends Controller {
  DebugInfo = DebugInfo;
  AttributeEditor = AttributeEditor;
  RdfaEditor = RdfaEditor;
  @tracked editableNodes = false;

  @action
  toggleEditableNodes() {
    this.editableNodes = !this.editableNodes;
  }

  @service declare importRdfaSnippet: importRdfaSnippet;
  @service declare intl: IntlService;
  @tracked controller?: SayController;
  @tracked citationPlugin = citationPlugin(
    this.config.citation as CitationPluginConfig,
  );
  @tracked validationPlugin = validation((schema: Schema) => ({
    shapes: [
      atLeastOneArticleContainer(schema),
      {
        name: 'exactly-one-title',
        focusNodeType: schema.nodes.besluit,
        path: ['besluit_title'],
        message: 'Document must contain exactly one title block.',
        constraints: {
          minCount: 1,
          maxCount: 1,
        },
      },
      {
        name: 'exactly-one-description',
        focusNodeType: schema.nodes.besluit,
        path: ['description'],
        message: 'Document must contain exactly one description block.',
        constraints: {
          minCount: 1,
          maxCount: 1,
        },
      },
      {
        name: 'max-one-motivation',
        focusNodeType: schema.nodes.besluit,
        path: ['motivering'],
        message: 'Document may not contain more than one motivation block.',
        constraints: {
          maxCount: 1,
        },
      },
    ],
  }));

  get report(): ValidationReport {
    if (!this.controller) {
      return { conforms: true };
    }
    const validationState = this.validationPlugin.getState(
      this.controller.mainEditorState,
    );
    if (!validationState) {
      return { conforms: true };
    }
    return validationState.report;
  }

  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
    say: 'https://say.data.gift/ns/',
  };

  get schema() {
    return new Schema({
      nodes: {
        doc: docWithConfig({ rdfaAware: true }),
        paragraph,

        repaired_block: repairedBlockWithConfig({ rdfaAware: true }),

        list_item: listItemWithConfig({ rdfaAware: true }),
        ordered_list: orderedListWithConfig({ rdfaAware: true }),
        bullet_list: bulletListWithConfig({ rdfaAware: true }),
        placeholder,
        ...tableNodes({
          tableGroup: 'block',
          cellContent: 'block+',
        }),
        date: date(this.dateOptions),
        text_variable,
        number,
        location,
        codelist,
        address,
        ...besluitNodes,
        roadsign_regulation,
        heading: headingWithConfig({ rdfaAware: true }),
        blockquote,

        horizontal_rule,
        code_block,

        text,

        image,

        hard_break,
        block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
        invisible_rdfa: invisibleRdfaWithConfig({ rdfaAware: true }),
        inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
        link: link(this.config.link),
      },
      marks: {
        em,
        strong,
        underline,
        strikethrough,
        redacted,
      },
    });
  }

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

  get config() {
    return {
      structures: structureSpecs,
      citation: {
        type: 'nodes',
        activeInNodeTypes(schema: Schema): Set<NodeType> {
          return new Set<NodeType>([schema.nodes.motivering]);
        },
        endpoint: 'https://codex.opendata.api.vlaanderen.be:8888/sparql',
        decisionsEndpoint:
          'https://publicatie.gelinkt-notuleren.lblod.info/sparql',
        defaultDecisionsGovernmentName: 'Edegem',
      },
      roadsignRegulation: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
        imageBaseUrl: 'https://register.mobiliteit.vlaanderen.be/',
      },
      besluitType: {
        endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
        classificatieUri:
          'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001',
      },
      besluitTopic: {
        endpoint: 'https://data.vlaanderen.be/sparql',
      },
      templateVariable: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
        zonalLocationCodelistUri:
          'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
        nonZonalLocationCodelistUri:
          'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
      },
      link: {
        interactive: true,
        rdfaAware: true,
      },
      worship: {
        endpoint: 'https://data.lblod.info/sparql',
      },
      lmb: {
        endpoint: 'http://localhost/vendor-proxy/query',
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
      text_variable: textVariableView(controller),
      number: numberView(controller),
      codelist: codelistView(controller),
      location: locationView(controller),
      link: linkView(this.config.link)(controller),
      date: dateView(this.dateOptions)(controller),
      address: addressView(controller),
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
    };
  };
  @tracked plugins: Plugin[] = [
    firefoxCursorFix(),
    chromeHacksPlugin(),
    lastKeyPressedPlugin,
    tablePlugin,
    tableKeymap,
    linkPasteHandler(this.schema.nodes.link),
    this.citationPlugin,
    this.validationPlugin,
    createInvisiblesPlugin([hardBreak, paragraphInvisible, headingInvisible], {
      shouldShowInvisibles: false,
    }),
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
      localStorage.getItem('EDITOR_CONTENT') ?? sampleData.DecisionTemplate;
    controller.initialize(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  get canInsertDescription() {
    return this.controller?.checkCommand(
      insertDescription({
        placeholderText: 'Geef korte beschrijving op',
        validateShapes: new Set(['exactly-one-description']),
      }),
    );
  }

  @action
  insertDescription() {
    this.controller?.doCommand(
      insertDescription({ placeholderText: 'Geef korte beschrijving op' }),
    );
    this.controller?.focus();
  }

  get canInsertTitle() {
    return this.controller?.checkCommand(
      insertTitle({
        placeholderText: 'Geef titel besluit op',
        validateShapes: new Set(['exactly-one-title']),
      }),
    );
  }

  @action
  insertTitle() {
    this.controller?.doCommand(
      insertTitle({
        placeholderText: 'Geef titel besluit op',
        validateShapes: new Set(['exactly-one-title']),
      }),
    );
    this.controller?.focus();
  }

  get canInsertMotivation() {
    return this.controller?.checkCommand(
      insertMotivation({
        intl: this.intl,
        validateShapes: new Set(['max-one-motivation']),
      }),
    );
  }

  @action
  insertMotivation() {
    this.controller?.doCommand(
      insertMotivation({
        intl: this.intl,
      }),
    );
    this.controller?.focus();
  }

  get canInsertContainer() {
    return this.controller?.checkCommand(
      insertArticleContainer({ intl: this.intl }),
    );
  }

  @action
  insertArticleContainer() {
    this.controller?.doCommand(insertArticleContainer({ intl: this.intl }));
    this.controller?.focus();
  }

  get standardTemplates() {
    return [
      {
        id: '728cc126-2bb2-11e9-a884-97ead76424d3',
        title: 'Vrije tekst',
        matches: [
          'Voeg sjabloon in voor besluit of vrij tekstveld (bijvoorbeeld voor een vraag, antwoord of tussenkomst)',
        ],
        contexts: [
          'http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt',
        ],
        disabledInContexts: [],
      },
      {
        id: 'b04fc03e-e8ff-496a-9343-1f07b4f55551',
        title: 'Minimaal besluit',
        matches: [
          'Voeg sjabloon in voor besluit of vrij tekstveld (bijvoorbeeld voor een vraag, antwoord of tussenkomst)',
        ],
        contexts: [
          'http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt',
        ],
        disabledInContexts: ['http://data.vlaanderen.be/ns/besluit#Besluit'],
      },
      {
        id: '2deed136-94c2-47ec-a542-8746cd020579',
        title: 'Aanvullend Reglement besluit',
        matches: [
          'Voeg sjabloon in voor besluit of vrij tekstveld (bijvoorbeeld voor een vraag, antwoord of tussenkomst)',
        ],
        contexts: [
          'http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt',
        ],
        disabledInContexts: ['http://data.vlaanderen.be/ns/besluit#Besluit'],
      },
      {
        id: '39c31a7e-2ba9-11e9-88cf-83ebfda837dc',
        title: 'Generiek besluit (klassieke stijl)',
        matches: [],
        contexts: [],
        disabledInContexts: ['http://data.vlaanderen.be/ns/besluit#Besluit'],
      },
      {
        id: '6933312e-2bac-11e9-af69-3baeff70b1a8',
        title: 'Generiek besluit (nieuwe stijl)',
        matches: [],
        contexts: [],
        disabledInContexts: ['http://data.vlaanderen.be/ns/besluit#Besluit'],
      },
    ];
  }
}
