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
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import {
  placeholder,
  placeholderEditing,
  placeholderView,
} from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { service } from '@ember/service';
import importRdfaSnippet from 'dummy/services/import-rdfa-snippet';
import { besluitTypeWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import { importSnippetWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/import-snippet-plugin';
import {
  rdfaDateCardWidget,
  rdfaDateInsertWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';
import { standardTemplateWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin';
import {
  tableOfContentsView,
  tableOfContents,
} from '@lblod/ember-rdfa-editor-lblod-plugins/ember-nodes/table-of-contents';
import { tableOfContentsWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin';
import { roadSignRegulationWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';
import { CodeList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-plugins/fetch-data';
import { insertVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/insert-variable-plugin';
import { templateVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-variable-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { NodeViewConstructor } from '@lblod/ember-rdfa-editor';
import {
  citation,
  citationCard,
  citationInsert,
  citationPlugin,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';

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
  inline_rdfa,
  block_rdfa,
  tableOfContents,
};
const marks = {
  citation,
  link,
  em,
  strong,
  underline,
  strikethrough,
};
const dummySchema = new Schema({ nodes, marks });

export default class IndexController extends Controller {
  @service declare importRdfaSnippet: importRdfaSnippet;
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
      placeholder: placeholderView,
      tableOfContents: tableOfContentsView(controller),
    };
  };
  @tracked plugins: Plugin[] = [
    placeholderEditing(),
    tablePlugin,
    citationPlugin(),
  ];
  @tracked widgets: WidgetSpec[] = [
    tableMenu,
    besluitTypeWidget,
    importSnippetWidget,
    rdfaDateCardWidget,
    rdfaDateInsertWidget,
    standardTemplateWidget,
    citationCard,
    citationInsert,
    tableOfContentsWidget(),
    roadSignRegulationWidget,
    insertVariableWidget(this.insertVariableWidgetOptions),
    templateVariableWidget,
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
    const presetContent = `
    <div property="prov:generated" resource="http://data.lblod.info/id/besluiten/ea1d2b7e-cc37-4b1d-b2a7-4ce9f30ee0b4" typeof="besluit:Besluit https://data.vlaanderen.be/id/concept/BesluitType/256bd04a-b74b-4f2a-8f5d-14dda4765af9 ext:BesluitNieuweStijl">
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
       <ul class="bullet-list"><li><span class="mark-highlight-manual">Rechtsgrond die bepaalt dat dit orgaan bevoegd is.</span></li></ul>
       <br>

      <h5>Juridische context</h5>
      <ul class="bullet-list"><li><a href="https://codex.vlaanderen.be/doc/document/1009730">Nieuwe gemeentewet</a>&nbsp;(KB 24/06/1988)</li><li>decreet <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1029017" property="eli:cites" typeof="eli:LegalExpression">over het lokaal bestuur</a> van 22/12/2017</li><li>wet <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1009628" property="eli:cites" typeof="eli:LegalExpression">betreffende de politie over het wegverkeer (wegverkeerswet - Wet van 16 maart 1968)</a></li><li>wegcode -&nbsp;<span data-editor-highlight="true">Koninklijk Besluit van 1 december 1975 houdende algemeen reglement op de politie van het wegverkeer en van het gebruik van de openbare weg.</span></li><li>code van de wegbeheerder -&nbsp;<span data-editor-highlight="true">ministrieel besluit van 11 oktober 1976 houdende de minimumafmetingen en de bijzondere plaatsingsvoorwaarden van de verkeerstekens</span></li></ul>
      <br>
      <em>specifiek voor aanvullende reglementen op het wegverkeer  (= politieverordeningen m.b.t. het wegverkeer voor wat betreft permanente of periodieke verkeerssituaties)</em>
      <ul class="bullet-list"><li>decreet <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1016816" property="eli:cites" typeof="eli:LegalExpression">betreffende de aanvullende reglementenop het wegverkeer en de plaatsing en bekostiging van de verkeerstekens </a>(16 mei 2008)</li><li>Besluit van de Vlaamse Regering <a class="annotation" href="https://codex.vlaanderen.be/doc/document/1017729" property="eli:cites" typeof="eli:LegalExpression">betreffende de aanvullende reglementen en de plaatsing en bekostiging van verkeerstekens</a>&ZeroWidthSpace; van 23 januari 2009</li><li><a href="https://codex.vlaanderen.be/doc/document/1035938" property="eli:cites" typeof="eli:LegalExpression">Omzendbrief MOB/2009/01 van 3 april 2009 gemeentelijke aanvullende reglementen op de politie over het wegverkeer</a></li></ul>

      <h5>Feitelijke context en argumentatie</h5>
      <ul class="bullet-list"><li><span class="mark-highlight-manual">Voeg context en argumentatie in</span></li></ul>
    </div>
    <br>
    <br>

    <h5>Beslissing</h5>

    <div property="prov:value" datatype="xsd:string">
      <div property="say:hasPart" resource="http://data.lblod.info/artikels/bbeb89ae-998b-4339-8de4-c8ab3a0679b5" typeof="say:Article">
        <span property="dct:type" resource="sometype"></span>
        <div property="say:heading">
          Artikel
          <span property="eli:number" datatype="xsd:string">
            1
          </span>
          :
          <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
        </div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div property="say:body" datatype='rdf:XMLLiteral'>
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </div>
      </div>
    </div>
   </div>`;
    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
