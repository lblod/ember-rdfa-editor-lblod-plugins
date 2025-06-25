// there is some irregular whitespace in one of the templates from the GN
// database we copied here verbatim
/* eslint-disable no-irregular-whitespace */
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
import {
  documentValidationPlugin,
  documentValidationPluginKey,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-validation-plugin';
// import { getShapeOfDocumentType } from '@lblod/lib-decision-shapes';

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
        imageBaseUrl: 'https://dev.roadsigns.lblod.info',
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
        endpoint: 'http://localhost/lpdc-service/doc/instantie',
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
      documentValidation: {
        documentShape: `@prefix dbo: <http://dbpedia.org/ontology/> .
@prefix dc: <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schemas: <https://schema.org/> .
@prefix shacl: <http://www.w3.org/ns/shacl#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ext:	<http://mu.semte.ch/vocabularies/ext/> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#ZoneShape> a shacl:NodeShape;
  shacl:closed false;
  shacl:property <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#ZoneShape/06750a3b20c69a1d055cfd0af2c2b5d6bf989bd2>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#ZoneShape/e9d8e42e8041e72c4534134d5a9044b03bed7ec5>;
  shacl:targetClass <https://data.vlaanderen.be/ns/mobiliteit#Zone> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#ZoneShape/06750a3b20c69a1d055cfd0af2c2b5d6bf989bd2> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Zone.geometrie";
  shacl:description "Ruimtelijke voorstelling van de Zone."@nl;
  shacl:maxCount 1;
  shacl:minCount 1;
   shacl:resultMessage "De zone moet een ruimtelijke voorstelling hebben";
  ext:successMessage "De zone heeft een ruimtelijke voorstelling";
  shacl:name "geometrie"@nl;
  shacl:path <http://www.w3.org/ns/locn#geometry> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#ZoneShape/e9d8e42e8041e72c4534134d5a9044b03bed7ec5> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Zone.naam";
  shacl:description "Naam van de Zone."@nl;
  shacl:minCount 1;
  shacl:maxCount 1;
  shacl:name "naam"@nl;
  shacl:resultMessage "De zone moet een label hebben";
  ext:successMessage "De zone heeft een label";
  shacl:path rdfs:label .


### Public Service

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape> a shacl:NodeShape;
  shacl:closed false;
  shacl:property <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape/f3050cd43354e672b971fdf4a69154a9bfa03a4a>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape/23779a18a5c2f44c8b0dab3a46507d75ba9170f7>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape/5bfc49675eef06366e6309009f937f9d904ac377>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape/d85ada83fe1a0861efd71a691b59b7b479524d74>;
  shacl:targetClass <http://purl.org/vocab/cpsv#PublicService> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape/23779a18a5c2f44c8b0dab3a46507d75ba9170f7> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Publiekedienstverlening.heeftvoorwaarde";
  shacl:description "Voorwaarden aan voldaan moet worden om gebruik te maken van de Publieke Dienstverlening."@nl;
  shacl:name "heeft voorwaarde"@nl;
  shacl:resultMessage "De Publieke Dienstverlening heeft geen woorwaarde gekoppeld";
  ext:successMessage "De Publieke Dienstverlening is correct gekoppeld aan een woorwaarde";
  shacl:path <http://vocab.belgif.be/ns/publicservice#hasRequirement> .


<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape/5bfc49675eef06366e6309009f937f9d904ac377> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Publiekedienstverlening.produceert";
  shacl:class <http://data.vlaanderen.be/ns/besluit#Vergunning>,
    <https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#Toegang>;
  shacl:description "Vergunning dat verkregen wordt als resultaat van de uitvoering van de Publieke Dienstverlening."@nl,
    "Recht op toegang dat verkregen wordt als resultaat van de uitvoering van de Publieke Dienstverlening."@nl;
  shacl:resultMessage "Please change this message don't know enough about the model";
  ext:successMessage "Please change this message don't know enough about the model";
  shacl:name "produceert"@nl;
  shacl:path <http://purl.org/vocab/cpsv#produces> .


<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape/d85ada83fe1a0861efd71a691b59b7b479524d74> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Publiekedienstverlening.volgt";
  shacl:class <https://data.vlaanderen.be/ns/omgevingsvergunning#Procedure>;
  shacl:description "Procedure die de Publieke Dienstverlening volgt."@nl;
  shacl:name "volgt"@nl;
  shacl:resultMessage "De Publieke Dienstverlening heeft geen procedure gekoppeld";
  ext:successMessage "De Publieke Dienstverlening is correct gekoppeld aan een procedure";
  shacl:path <http://purl.org/vocab/cpsv#follows> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#PubliekeDienstverleningShape/f3050cd43354e672b971fdf4a69154a9bfa03a4a> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Publiekedienstverlening.heeftoutputtype";
  shacl:description "De types die de Output van de Publieke Dienstverlening heeft. "@nl;
  shacl:name "heeft outputtype"@nl;
  shacl:resultMessage "Please change this message don't know enough about the model";
  ext:successMessage "Please change this message don't know enough about the model";
  shacl:path <https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#heeftOutputtype> .



### Requirement

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape> a shacl:NodeShape;
  shacl:closed false;
  shacl:property <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/0e9a7d4dbf6ec19568d474169ad717f71e882319>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/f8b3af2bcda47f912651c708834ece4ee96f4527>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/89c5f32c3193aad42bb0968537063a1363bc30ee>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/f7451c5bb3419860d9a0527686f0bd5efdad4491>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/236f0210baaf149903750c43bbe7012c21debb2a>;
  shacl:targetClass <http://data.europa.eu/m8g/Requirement> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/0e9a7d4dbf6ec19568d474169ad717f71e882319> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Voorwaarde.beschrijving";
  shacl:datatype rdf:langString;
  shacl:maxCount 1;
  shacl:minCount 1;
  shacl:description "Korte uitleg over de aard, kenmerken, toepassingen of andere aanvullende informatie die helpt bij het verduidelijken van de Voorwaarde."@nl;
  shacl:resultMessage "De woorwaarde hebben een juist beschrijving";
  ext:successMessage "De woorwaarde heeft geen beschrijving";
  shacl:name "beschrijving"@nl;
  shacl:path dc:description .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/236f0210baaf149903750c43bbe7012c21debb2a> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Voorwaarde.type";
  shacl:description "Classificering van de Voorwaarde aan de hand van een gecontroleerde codelijst."@nl;
  shacl:maxCount 1;
  shacl:minCount 1;
  shacl:name "type"@nl;
  shacl:resultMessage "De woorwaarde hebben een juist type";
  ext:successMessage "De woorwaarde heeft geen type";
  shacl:path dc:type .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/89c5f32c3193aad42bb0968537063a1363bc30ee> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Voorwaarde.heeftondersteunendbewijs";
  shacl:class <http://data.europa.eu/m8g/Evidence>;
  shacl:description "Bewijs dat informatie/ondersteuning biedt voor de Voorwaarde."@nl;
  shacl:name "heeft ondersteunend bewijs"@nl;
  shacl:resultMessage "Woorwaarde is niet correct gekoppeld aan het bewijs";
  ext:successMessage "Geen problemen met het verband tussen de woorwaarden en het bewijs";
  shacl:path <http://data.europa.eu/m8g/hasSupportingEvidence> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/f7451c5bb3419860d9a0527686f0bd5efdad4491> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Voorwaarde.isvoorwaardevan";
  shacl:class <https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#Voorwaardecollectie>;
  shacl:description "Supervoorwaarde van de Voorwaarde."@nl;
  shacl:name "is voorwaarde van"@nl;
  shacl:resultMessage "Requirement is niet correct gekoppeld aan de collectie";
  ext:successMessage "Geen problemen met de koppeling van woorwaarden aan de collectie";
  shacl:path <http://data.europa.eu/m8g/isRequirementOf> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeShape/f8b3af2bcda47f912651c708834ece4ee96f4527> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Voorwaarde.heeftbewijstypelijst";
  shacl:class <http://data.europa.eu/m8g/EvidenceTypeList>;
  shacl:description "Bewijstypelijst dat specificieert welke Bewijstypes nodig zijn om aan de Voorwaarde te voldoen."@nl;
  shacl:name "heeft bewijstypelijst"@nl;
  shacl:resultMessage "De voorwaarde moet een bewijstypelijst hebben";
  ext:successMessage "De voorwaarde heeft een bewijstypelijst";
  shacl:path <http://data.europa.eu/m8g/hasEvidenceTypeList> .



### Requirement collection

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeCollectieShape> a shacl:NodeShape;
  shacl:closed false;
  shacl:property <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeCollectieShape/23779a18a5c2f44c8b0dab3a46507d75ba9170f7>,
    <https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeCollectieShape/481218c045793f428f6d7d5507279a4fefc8910a>;
  shacl:targetClass <https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#Voorwaardecollectie> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeCollectieShape/23779a18a5c2f44c8b0dab3a46507d75ba9170f7> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Voorwaardecollectie.heeftvoorwaarde";
  shacl:description "Subvoorwaarde van de Voorwaarde."@nl;
  shacl:name "heeft voorwaarde"@nl;
  shacl:resultMessage "De voorwaarde collectie moet een subvoorwaarde hebben";
  ext:successMessage "De voorwaarde collectie heeft een subvoorwaarde ";
  shacl:path <http://data.europa.eu/m8g/hasRequirement> .

<https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#VoorwaardeCollectieShape/481218c045793f428f6d7d5507279a4fefc8910a> rdfs:seeAlso "https://data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-intelligente-toegang/ontwerpstandaard/2024-12-19#Voorwaardecollectie.operatie";
  shacl:description "Logische operatie die toegepast wordt op de Voorwaarden."@nl;
  shacl:name "operatie"@nl;
  shacl:resultMessage "Please change this message don't know enough about the model";
  ext:successMessage "Please change this message don't know enough about the model";
  shacl:minCount 1;
  shacl:maxCount 1;
  shacl:path <https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#operatie> .`,
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
    documentValidationPlugin(this.config.documentValidation),
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

  @action
  async validateDocument() {
    if (!this.controller) return;
    const pluginState = documentValidationPluginKey.getState(
      this.controller.mainEditorView.state,
    );
    if (!pluginState) return;
    const { validationCallback } = pluginState;
    await validationCallback(
      this.controller.mainEditorView,
      this.controller.htmlContent,
    );
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
        body: /* HTML */ `<p
          ><span class="mark-highlight-manual"
            >Vrije tekst voor bijvoorbeeld vraag, antwoord, amendement,
            mededeling of tussenkomst.</span
          ></p
        >`,
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
        body: /* HTML */ `
          "
          <div
            property="prov:generated"
            resource="http://data.lblod.info/id/besluiten/--ref-uuid4-c10209c0-dfba-46fb-80c7-1c6aedf656e9"
            typeof="besluit:Besluit ext:BesluitNieuweStijl"
            data-label="Besluit"
          >
            <div style="display: none" data-rdfa-container="true">
              <span
                property="eli:language"
                resource="http://publications.europa.eu/resource/authority/language/NLD"
              />
            </div>
            <div data-content-container="true">
              <div
                property="eli:title"
                datatype="xsd:string"
                data-label="Openbare titel besluit"
              >
                <h4
                  ><span class="mark-highlight-manual"
                    >Geef titel besluit op</span
                  ></h4
                >
              </div>
              <div
                property="eli:description"
                datatype="xsd:string"
                data-label="Korte openbare beschrijving"
              >
                <p
                  ><span class="mark-highlight-manual"
                    >Geef korte beschrijving op</span
                  ></p
                >
              </div>
              <div
                property="besluit:motivering"
                lang="nl"
                data-label="Motivering"
              >
                <p
                  ><span class="mark-highlight-manual"
                    >geef bestuursorgaan op</span
                  >,</p
                >
                <br />
                <h5>Bevoegdheid</h5>
                <ul class="bullet-list">
                  <li
                    ><span class="mark-highlight-manual"
                      >Rechtsgrond die bepaalt dat dit orgaan bevoegd is.</span
                    ></li
                  >
                </ul>
                <br />
                <h5>Juridische context</h5>
                <ul class="bullet-list">
                  <li
                    ><span class="mark-highlight-manual"
                      >Voeg juridische context in</span
                    ></li
                  >
                </ul>
                <br />
                <h5>Feitelijke context en argumentatie</h5>
                <ul class="bullet-list">
                  <li
                    ><span class="mark-highlight-manual"
                      >Voeg context en argumentatie in</span
                    ></li
                  >
                </ul>
              </div>
              <br />
              <br />
              <h5>Beslissing</h5>
              <div
                property="prov:value"
                datatype="xsd:string"
                data-label="Artikels"
              >
                <div
                  property="eli:has_part"
                  resource="http://data.lblod.info/artikels/--ref-uuid4-7a0552ff-4fb1-4e42-98d6-dd88faf60f0c"
                  typeof="besluit:Artikel"
                  data-say-is-only-article="true"
                >
                  <div
                    >Artikel
                    <span property="eli:number" datatype="xsd:string"
                      >1</span
                    ></div
                  >
                  <div property="prov:value" datatype="xsd:string">
                    <span class="mark-highlight-manual">Voer inhoud in</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          "
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
        body: /* HTML */ `<div
          property="prov:generated"
          resource="http://data.lblod.info/id/besluiten/--ref-uuid4-c10209c0-dfba-46fb-80c7-1c6aedf656e9"
          typeof="besluit:Besluit https://data.vlaanderen.be/id/concept/BesluitType/67378dd0-5413-474b-8996-d992ef81637a ext:BesluitNieuweStijl"
          data-label="Besluit"
        >
          <div style="display: none" data-rdfa-container="true">
            <span
              property="eli:language"
              resource="http://publications.europa.eu/resource/authority/language/NLD"
            />
          </div>
          <div data-content-container="true">
            <div
              property="eli:title"
              datatype="xsd:string"
              data-label="Openbare titel besluit"
            >
              <h4
                ><span class="mark-highlight-manual"
                  >Geef titel besluit op</span
                ></h4
              >
            </div>
            <div
              property="eli:description"
              datatype="xsd:string"
              data-label="Korte openbare beschrijving"
            >
              <p
                ><span class="mark-highlight-manual"
                  >Geef korte beschrijving op</span
                ></p
              >
            </div>
            <br />
            <div
              property="besluit:motivering"
              lang="nl"
              data-label="Motivering"
            >
              <p
                ><span class="mark-highlight-manual"
                  >geef bestuursorgaan op</span
                >,
              </p>
              <br />
              <h5>Bevoegdheid</h5>
              <ul class="bullet-list">
                <li
                  ><span class="mark-highlight-manual"
                    >Rechtsgrond die bepaalt dat dit orgaan bevoegd is.</span
                  ></li
                >
              </ul>
              <br />
              <h5>Juridische context</h5>
              <ul class="bullet-list">
                <li
                  ><a
                    class="annotation"
                    property="eli:cites"
                    typeof="eli:LegalExpression"
                    href="https://codex.vlaanderen.be/doc/document/1009730"
                    >Nieuwe gemeentewet</a
                  >&nbsp;(KB 24/06/1988)</li
                >
                <li
                  >decreet
                  <a
                    class="annotation"
                    href="https://codex.vlaanderen.be/doc/document/1029017"
                    property="eli:cites"
                    typeof="eli:LegalExpression"
                    >over het lokaal bestuur</a
                  >
                  van 22/12/2017</li
                >
                <li
                  >wet
                  <a
                    class="annotation"
                    href="https://codex.vlaanderen.be/doc/document/1009628"
                    property="eli:cites"
                    typeof="eli:LegalExpression"
                    >betreffende de politie over het wegverkeer (wegverkeerswet
                    - Wet van 16 maart 1968)</a
                  ></li
                >
                <li
                  >wegcode - Koninklijk Besluit
                  <a
                    class="annotation"
                    href="https://codex.vlaanderen.be/doc/document/1036242"
                    property="eli:cites"
                    typeof="eli:LegalExpression"
                    >van 1 december 1975 houdende algemeen reglement op de
                    politie van het wegverkeer en van het gebruik van de
                    openbare weg.</a
                  ></li
                >
                <li
                  >code van de wegbeheerder -
                  <a
                    class="annotation"
                    href="https://codex.vlaanderen.be/doc/document/1035575"
                    property="eli:cites"
                    typeof="eli:LegalExpression"
                    >ministerieel besluit van 11 oktober 1976 houdende de
                    minimumafmetingen en de bijzondere plaatsingsvoorwaarden van
                    de verkeerstekens</a
                  ></li
                >
              </ul>
              <br />
              <em
                >specifiek voor aanvullende reglementen op het wegverkeer (=
                politieverordeningen m.b.t. het wegverkeer voor wat betreft
                permanente of periodieke verkeerssituaties)</em
              >
              <ul class="bullet-list">
                <li
                  >decreet
                  <a
                    class="annotation"
                    href="https://codex.vlaanderen.be/doc/document/1016816"
                    property="eli:cites"
                    typeof="eli:LegalExpression"
                    >betreffende de aanvullende reglementen op het wegverkeer en
                    de plaatsing en bekostiging van de verkeerstekens </a
                  >(16 mei 2008)</li
                >
                <li
                  >Besluit van de Vlaamse Regering
                  <a
                    class="annotation"
                    href="https://codex.vlaanderen.be/doc/document/1017729"
                    property="eli:cites"
                    typeof="eli:LegalExpression"
                    >betreffende de aanvullende reglementen en de plaatsing en
                    bekostiging van verkeerstekens</a
                  >​ van 23 januari 2009</li
                >
                <li
                  ><a
                    href="https://codex.vlaanderen.be/doc/document/1035938"
                    property="eli:cites"
                    typeof="eli:LegalExpression"
                    >Omzendbrief MOB/2009/01 van 3 april 2009 gemeentelijke
                    aanvullende reglementen op de politie over het wegverkeer</a
                  ></li
                >
              </ul>
              <h5>Feitelijke context en argumentatie</h5>
              <ul class="bullet-list">
                <li
                  ><span class="mark-highlight-manual"
                    >Voeg context en argumentatie in</span
                  ></li
                >
              </ul>
            </div>
            <br />
            <br />
            <h5>Beslissing</h5>
            <div
              property="prov:value"
              datatype="xsd:string"
              data-label="Artikels"
            >
              <div
                property="eli:has_part"
                resource="http://data.lblod.info/artikels/--ref-uuid4-68c56ef4-8843-4b7f-a72a-9d0038ff723f"
                typeof="besluit:Artikel"
                data-say-is-only-article="true"
              >
                <div>
                  Artikel
                  <span property="eli:number" datatype="xsd:string">1</span>
                </div>
                <div property="prov:value" datatype="xsd:string">
                  <span class="mark-highlight-manual">Voer inhoud in</span>
                </div>
              </div>
            </div>
          </div>
        </div>`,
      },
      {
        id: '39c31a7e-2ba9-11e9-88cf-83ebfda837dc',
        title: 'Generiek besluit (klassieke stijl)',
        matches: [],
        contexts: [],
        disabledInContexts: ['http://data.vlaanderen.be/ns/besluit#Besluit'],
        body: /* HTML */ `<div
          property="prov:generated"
          resource="http://data.lblod.info/id/besluiten/--ref-uuid4-5ab24a9b-4760-4607-81c1-38dd53c13dff"
          typeof="besluit:Besluit ext:BesluitKlassiekeStijl"
          data-label="Besluit"
        >
          <div style="display: none" data-rdfa-container="true">
            <span
              property="eli:language"
              resource="http://publications.europa.eu/resource/authority/language/NLD"
            />
          </div>
          <div data-content-container="true">
            <div
              property="eli:title"
              datatype="xsd:string"
              data-label="Openbare titel besluit"
            >
              <h5
                ><span class="mark-highlight-manual"
                  >Geef titel besluit op</span
                ></h5
              >
            </div>
            <div
              property="eli:description"
              datatype="xsd:string"
              data-label="Korte openbare beschrijving"
            >
              <p
                ><span class="mark-highlight-manual"
                  >Geef korte beschrijving op</span
                ></p
              >
            </div>
            <div
              property="besluit:motivering"
              lang="nl"
              data-label="Motivering"
            >
              <p
                ><span class="mark-highlight-manual"
                  >geef bestuursorgaan op</span
                >,</p
              >
              <br />
              <div>
                <ul class="bullet-list">
                  <li
                    >Gelet op
                    <span class="mark-highlight-manual"
                      >Voeg juridische grond in</span
                    >;</li
                  >
                </ul>
              </div>
              <br />
              <div>
                <ul class="bullet-list">
                  <li
                    >Overwegende dat
                    <span class="mark-highlight-manual">Voeg motivering in</span
                    >;</li
                  >
                </ul>
              </div>
            </div>
            <br />
            <br />
            <p class="u-spacer--small">Beslist,</p>
            <div
              property="prov:value"
              datatype="xsd:string"
              data-label="Artikels"
            >
              <div
                property="eli:has_part"
                resource="http://data.lblod.info/artikels/--ref-uuid4-69ba01d6-db79-4b36-8ed4-d824269724df"
                typeof="besluit:Artikel"
                data-say-is-only-article="true"
              >
                <div>
                  Artikel
                  <span property="eli:number" datatype="xsd:string">1</span>
                </div>
                <div property="prov:value" datatype="xsd:string">
                  <span class="mark-highlight-manual">Voer inhoud in</span>
                </div>
              </div>
            </div>
          </div>
        </div>`,
      },
      {
        id: '6933312e-2bac-11e9-af69-3baeff70b1a8',
        title: 'Generiek besluit (nieuwe stijl)',
        matches: [],
        contexts: [],
        disabledInContexts: ['http://data.vlaanderen.be/ns/besluit#Besluit'],
        body: /* HTML */ `<div
          property="prov:generated"
          resource="http://data.lblod.info/id/besluiten/--ref-uuid4-c10209c0-dfba-46fb-80c7-1c6aedf656e9"
          typeof="besluit:Besluit ext:BesluitNieuweStijl"
          data-label="Besluit"
        >
          <div style="display: none" data-rdfa-container="true">
            <span
              property="eli:language"
              resource="http://publications.europa.eu/resource/authority/language/NLD"
            />
          </div>
          <div data-content-container="true">
            <div
              property="eli:title"
              datatype="xsd:string"
              data-label="Openbare titel besluit"
            >
              <h4
                ><span class="mark-highlight-manual"
                  >Geef titel besluit op</span
                ></h4
              >
            </div>
            <div
              property="eli:description"
              datatype="xsd:string"
              data-label="Korte openbare beschrijving"
            >
              <p
                ><span class="mark-highlight-manual"
                  >Geef korte beschrijving op</span
                ></p
              >
            </div>
            <div
              property="besluit:motivering"
              lang="nl"
              data-label="Motivering"
            >
              <p
                ><span class="mark-highlight-manual"
                  >geef bestuursorgaan op</span
                >,</p
              >
              <br />
              <h5>Bevoegdheid</h5>
              <ul class="bullet-list">
                <li
                  ><span class="mark-highlight-manual"
                    >Rechtsgrond die bepaalt dat dit orgaan bevoegd is.</span
                  ></li
                >
              </ul>
              <br />
              <h5>Juridische context</h5>
              <ul class="bullet-list">
                <li
                  ><span class="mark-highlight-manual"
                    >Voeg juridische context in</span
                  ></li
                >
              </ul>
              <br />
              <h5>Feitelijke context en argumentatie</h5>
              <ul class="bullet-list">
                <li
                  ><span class="mark-highlight-manual"
                    >Voeg context en argumentatie in</span
                  ></li
                >
              </ul>
            </div>
            <br />
            <br />
            <h5>Beslissing</h5>
            <div
              property="prov:value"
              datatype="xsd:string"
              data-label="Artikels"
            >
              <div
                property="eli:has_part"
                resource="http://data.lblod.info/artikels/--ref-uuid4-7a0552ff-4fb1-4e42-98d6-dd88faf60f0c"
                typeof="besluit:Artikel"
                data-say-is-only-article="true"
              >
                <div
                  >Artikel
                  <span property="eli:number" datatype="xsd:string"
                    >1</span
                  ></div
                >
                <div property="prov:value" datatype="xsd:string">
                  <span class="mark-highlight-manual">Voer inhoud in</span>
                </div>
              </div>
            </div>
          </div>
        </div>`,
      },
    ];
  }
}
