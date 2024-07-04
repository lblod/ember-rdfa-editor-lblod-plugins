import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import {
  NodeType,
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
import { roadsign_regulation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/nodes';
import {
  citationPlugin,
  CitationPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import {
  codelist,
  number,
  text_variable,
  location,
  textVariableView,
  numberView,
  codelistView,
  locationView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import {
  osloLocation,
  osloLocationView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
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
import {
  structure,
  structureView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import { SayNodeViewConstructor } from '@lblod/ember-rdfa-editor/utils/ember-node';

import InsertArticleComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/decision-plugin/insert-article';
import StructureControlCardComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/structure-plugin/_private/control-card';
import applyDevTools from 'prosemirror-dev-tools';
import recreateUuidsOnPaste from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/recreateUuidsOnPaste';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import { getOwner } from '@ember/application';

export default class BesluitSampleController extends Controller {
  DebugInfo = DebugInfo;
  AttributeEditor = AttributeEditor;
  RdfaEditor = RdfaEditor;
  InsertArticle = InsertArticleComponent;
  StructureControlCard = StructureControlCardComponent;

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
        structure,

        repaired_block: repairedBlockWithConfig({ rdfaAware: true }),

        list_item: listItemWithConfig({}),
        ordered_list: orderedListWithConfig({}),
        bullet_list: bulletListWithConfig({}),
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
        oslo_location: osloLocation(this.config.location),
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
      lpdc: {
        // Needs to point at the same port as the ember app
        endpoint: 'http://localhost/lpdc-service',
      },
      location: {
        defaultPointUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/geometrie/',
        defaultPlaceUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/plaats/',
        defaultAddressUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/adres/',
      },
    };
  }

  get activeNode() {
    if (this.controller) {
      return getActiveEditableNode(this.controller.activeEditorState);
    }
    return;
  }
  get supportsTables() {
    return this.controller?.activeEditorState.schema.nodes['table_cell'];
  }

  @tracked rdfaEditor?: SayController;
  @tracked nodeViews: (
    controller: SayController,
  ) => Record<string, SayNodeViewConstructor> = (controller) => {
    return {
      text_variable: textVariableView(controller),
      number: numberView(controller),
      codelist: codelistView(controller),
      location: locationView(controller),
      link: linkView(this.config.link)(controller),
      date: dateView(this.dateOptions)(controller),
      oslo_location: osloLocationView(this.config.location)(controller),
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
      structure: structureView(controller),
    } satisfies Record<string, SayNodeViewConstructor>;
  };
  @tracked plugins: Plugin[] = [
    firefoxCursorFix(),
    chromeHacksPlugin(),
    lastKeyPressedPlugin,
    tablePlugin,
    tableKeymap,
    linkPasteHandler(this.schema.nodes.link),
    this.citationPlugin,
    createInvisiblesPlugin([hardBreak, paragraphInvisible, headingInvisible], {
      shouldShowInvisibles: false,
    }),
    editableNodePlugin(),
    emberApplication({ application: getOwner(this) }),
    recreateUuidsOnPaste,
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
