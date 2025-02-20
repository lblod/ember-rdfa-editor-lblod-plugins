import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import { Plugin, PNode, SayController, Schema } from '@lblod/ember-rdfa-editor';
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
  personVariableView,
  person_variable,
  autofilled_variable,
  autofilledVariableView,
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
  structureWithConfig,
  structureViewWithConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import { SayNodeViewConstructor } from '@lblod/ember-rdfa-editor/utils/ember-node';

import InsertArticleComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/decision-plugin/insert-article';
import StructureControlCardComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/structure-plugin/control-card';
import applyDevTools from 'prosemirror-dev-tools';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import {
  mandatee_table,
  mandateeTableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/mandatee-table-plugin/node';
import { MANDATEE_TABLE_SAMPLE_CONFIG } from '../config/mandatee-table-sample-config';
import { variableAutofillerPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/plugins/autofiller';
import {
  snippetPlaceholder,
  snippetPlaceholderView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet-placeholder';
import {
  snippet,
  snippetView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet';
import { BlockRDFaView } from '@lblod/ember-rdfa-editor/nodes/block-rdfa';
import { isRdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import recreateUuidsOnPaste from '@lblod/ember-rdfa-editor/plugins/recreateUuidsOnPaste';
import { getOwner } from '@ember/owner';

export default class BesluitSampleController extends Controller {
  queryParams = ['editableNodes'];

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
        structure: structureWithConfig(this.config.structure),

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
        person_variable,
        autofilled_variable,
        number,
        location,
        codelist,
        oslo_location: osloLocation(this.config.location),
        roadsign_regulation,
        mandatee_table,
        heading: headingWithConfig({ rdfaAware: false }),
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
        snippet_placeholder: snippetPlaceholder(this.config.snippet),
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
        activeInNode(node: PNode): boolean {
          const { attrs } = node;
          if (!isRdfaAttrs(attrs)) {
            return false;
          }
          const match = attrs.backlinks.find((bl) =>
            BESLUIT('motivering').matches(bl.predicate),
          );
          return Boolean(match);
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
        // uncomment to test external triple mode
        // decisionUri: 'http://example.org/1',
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
        endpoint: 'https://dev.gelinkt-notuleren.lblod.info/sparql',
      },
      lpdc: {
        // Needs to be exposed locally without authentication as otherwise calls fail
        endpoint: 'http://localhost/lpdc-service',
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
      mandateeTable: {
        config: MANDATEE_TABLE_SAMPLE_CONFIG,
        tags: Object.keys(MANDATEE_TABLE_SAMPLE_CONFIG),
        defaultTag: Object.keys(MANDATEE_TABLE_SAMPLE_CONFIG)[0],
      },
      autofilledVariable: {
        autofilledValues: {
          administrativeUnit: 'Geemente Aalst',
          dateRightNow: new Date().toLocaleString(),
        },
      },
      snippet: {
        endpoint: 'https://dev.reglementairebijlagen.lblod.info/sparql',
      },
      structure: {
        fullLengthArticles: false,
        onlyArticleSpecialName: true,
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
      person_variable: personVariableView(controller),
      number: numberView(controller),
      codelist: codelistView(controller),
      location: locationView(controller),
      link: linkView(this.config.link)(controller),
      date: dateView(this.dateOptions)(controller),
      oslo_location: osloLocationView(this.config.location)(controller),
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
      structure: structureViewWithConfig(this.config.structure)(controller),
      mandatee_table: mandateeTableView(controller),
      autofilled_variable: autofilledVariableView(controller),
      snippet_placeholder: snippetPlaceholderView(this.config.snippet)(
        controller,
      ),
      snippet: snippetView(this.config.snippet)(controller),
      block_rdfa: (node) => new BlockRDFaView(node),
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
    emberApplication({ application: unwrap(getOwner(this)) }),
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
        body: '<p><span class="mark-highlight-manual">Vrije tekst voor bijvoorbeeld vraag, antwoord, amendement, mededeling of tussenkomst.</span></p>',
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
        body: `
          <div property="prov:generated" resource="http://data.lblod.info/id/besluiten/\${generateUuid()}" typeof="besluit:Besluit ext:BesluitNieuweStijl">
            <p>Openbare titel besluit:</p>
            <h4 class="h4" property="eli:title" datatype="xsd:string"><span class="mark-highlight-manual">Geef titel besluit op</span></h4>
            <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
            <br>
            <p>Korte openbare beschrijving:</p>
            <p property="eli:description" datatype="xsd:string"><span class="mark-highlight-manual">Geef korte beschrijving op</span></p>
          </div>
        `,
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
        body: `
          <div property="prov:generated" resource="http://data.lblod.info/id/besluiten/\${generateUuid()}" typeof="besluit:Besluit https://data.vlaanderen.be/id/concept/BesluitType/67378dd0-5413-474b-8996-d992ef81637a ext:BesluitNieuweStijl">
            <p>Openbare titel besluit:</p>
            <h4 class="h4" property="eli:title" datatype="xsd:string"><span class="mark-highlight-manual">Geef titel besluit op</span></h4>
            <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
            <p>Korte openbare beschrijving:</p>
            <p property="eli:description" datatype="xsd:string"><span class="mark-highlight-manual">Geef korte beschrijving op</span></p>
            <br>

            <div property="besluit:motivering" lang="nl">
              <p>
                <span class="mark-highlight-manual">geef bestuursorgaan op</span>,
              </p>
              <br>

              <h5>Bevoegdheid</h5>
              <ul class="bullet-list">
                <li><span class="mark-highlight-manual">Rechtsgrond die bepaalt dat dit orgaan bevoegd is.</span></li>
              </ul>
              <br>

              <h5>Juridische context</h5>
              <ul class="bullet-list">
                <li><a class="annotation" property="eli:cites" typeof="eli:LegalExpression" href="https://codex.vlaanderen.be/doc/document/1009730">Nieuwe gemeentewet</a>&nbsp;(KB 24/06/1988)</li>
                <li>decreet <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1029017" property="eli:cites" typeof="eli:LegalExpression">over het lokaal bestuur</a> van 22/12/2017</li>
                <li>wet <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1009628" property="eli:cites" typeof="eli:LegalExpression">betreffende de politie over het wegverkeer (wegverkeerswet - Wet van 16 maart 1968)</a></li>
                <li>wegcode - Koninklijk Besluit <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1036242" property="eli:cites" typeof="eli:LegalExpression">van 1 december 1975 houdende algemeen reglement op de politie van het wegverkeer en van het gebruik van de openbare weg.</a></li>
                <li>code van de wegbeheerder - <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1035575" property="eli:cites" typeof="eli:LegalExpression">ministerieel besluit van 11 oktober 1976 houdende de minimumafmetingen en de bijzondere plaatsingsvoorwaarden van de verkeerstekens</a></li>
              </ul>
              <br>
              <em>specifiek voor aanvullende reglementen op het wegverkeer  (= politieverordeningen m.b.t. het wegverkeer voor wat betreft permanente of periodieke verkeerssituaties)</em>
              <ul class="bullet-list">
                <li>decreet <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1016816" property="eli:cites" typeof="eli:LegalExpression">betreffende de aanvullende reglementen op het wegverkeer en de plaatsing en bekostiging van de verkeerstekens </a>(16 mei 2008)</li>
                <li>Besluit van de Vlaamse Regering <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1017729" property="eli:cites" typeof="eli:LegalExpression">betreffende de aanvullende reglementen en de plaatsing en bekostiging van verkeerstekens</a> van 23 januari 2009</li>
                    <li><a href="https://codex.vlaanderen.be/doc/document/1035938" property="eli:cites" typeof="eli:LegalExpression">Omzendbrief MOB/2009/01 van 3 april 2009 gemeentelijke aanvullende reglementen op de politie over het wegverkeer</a></li>
              </ul>

              <h5>Feitelijke context en argumentatie</h5>
              <ul class="bullet-list">
                <li><span class="mark-highlight-manual">Voeg context en argumentatie in</span></li>
              </ul>
            </div>
            <br>
            <br>

            <h5>Beslissing</h5>

            <div property="prov:value" datatype="xsd:string">
              <div property="eli:has_part" resource="http://data.lblod.info/artikels/\${generateUuid()}" typeof="besluit:Artikel" data-say-is-only-article="true">
                <div>Artikel <span property="eli:number" datatype="xsd:string">1</span></div>
                <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
                <div property="prov:value" datatype="xsd:string">
                  <span class="mark-highlight-manual">Voer inhoud in</span>
                </div>
              </div>
            </div>
          </div>
        `,
      },
      {
        id: '39c31a7e-2ba9-11e9-88cf-83ebfda837dc',
        title: 'Generiek besluit (klassieke stijl)',
        matches: [],
        contexts: [],
        disabledInContexts: ['http://data.vlaanderen.be/ns/besluit#Besluit'],
        body: `
          <div property="prov:generated" resource="http://data.lblod.info/id/besluiten/\${generateUuid()}" typeof="besluit:Besluit ext:BesluitKlassiekeStijl">
            <p>Openbare titel besluit:</p>
            <h5 class="h4" property="eli:title" datatype="xsd:string"><span class="mark-highlight-manual">Geef openbare titel besluit op</span></h5>
            <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
            <br>
            <p>Korte openbare beschrijving:</p>
            <p property="eli:description" datatype="xsd:string"><span class="mark-highlight-manual">Geef korte beschrijving op</span></p>
            <br>


            <div property="besluit:motivering" lang="nl">
              <p>
                <span class="mark-highlight-manual">geef bestuursorgaan op</span>,
              </p>
              <br>

              <div>
                <ul class="bullet-list">
                  <li>Gelet op <span class="mark-highlight-manual">Voeg juridische grond in</span>;</li>
                </ul>
              </div>

              <br>
              <div>
                <ul class="bullet-list">
                  <li>Overwegende dat <span class="mark-highlight-manual">Voeg motivering in</span>;</li>
                </ul>
              </div>
            </div>
            <br>
            <br>

            <p class="u-spacer--small">Beslist,</p>
            <div property="prov:value" datatype="xsd:string">
              <div property="eli:has_part" resource="http://data.lblod.info/artikels/\${generateUuid()}" typeof="besluit:Artikel" data-say-is-only-article="true">
                <div>Artikel <span property="eli:number" datatype="xsd:string">1</span></div>
                <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
                <div property="prov:value" datatype="xsd:string"><span class="mark-highlight-manual">Voer inhoud in</span></div>
              </div>
            </div>
          </div>
        `,
      },
      {
        id: '6933312e-2bac-11e9-af69-3baeff70b1a8',
        title: 'Generiek besluit (nieuwe stijl)',
        matches: [],
        contexts: [],
        disabledInContexts: ['http://data.vlaanderen.be/ns/besluit#Besluit'],
        body: `
          <div property="prov:generated" resource="http://data.lblod.info/id/besluiten/\${generateUuid()}" typeof="besluit:Besluit ext:BesluitNieuweStijl">
          <p>Openbare titel besluit:</p>
          <h4 class="h4" property="eli:title" datatype="xsd:string"><span class="mark-highlight-manual">Geef titel besluit op</span></h4>
          <span style="display: none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span> <br />
          <p>Korte openbare beschrijving:</p>
          <p property="eli:description" datatype="xsd:string"><span class="mark-highlight-manual">Geef korte beschrijving op</span></p>
          <br />
          <div property="besluit:motivering" lang="nl">
            <p><span class="mark-highlight-manual">geef bestuursorgaan op</span>,</p>
            <br />
            <h5>Bevoegdheid</h5>
            <ul class="bullet-list">
              <li><span class="mark-highlight-manual">Rechtsgrond die bepaalt dat dit orgaan bevoegd is.</span></li>
            </ul>
            <br />
            <h5>Juridische context</h5>
            <ul class="bullet-list">
              <li><span class="mark-highlight-manual">Voeg juridische context in</span></li>
            </ul>
            <br />
            <h5>Feitelijke context en argumentatie</h5>
            <ul class="bullet-list">
              <li><span class="mark-highlight-manual">Voeg context en argumentatie in</span></li>
            </ul>
          </div>
          <br />
          <br />
          <h5>Beslissing</h5>
          <div property="prov:value" datatype="xsd:string">
            <div property="eli:has_part" resource="http://data.lblod.info/artikels/\${generateUuid()}" typeof="besluit:Artikel" data-say-is-only-article="true">
              <div>Artikel <span property="eli:number" datatype="xsd:string">1</span></div>
              <span style="display: none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
              <div property="prov:value" datatype="xsd:string"><span class="mark-highlight-manual">Voer inhoud in</span></div>
            </div>
          </div>
        </div>
        `,
      },
    ];
  }
}
