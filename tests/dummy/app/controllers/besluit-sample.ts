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
  doc,
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
  placeholder,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { service } from '@ember/service';
import importRdfaSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/services/import-rdfa-snippet';
import { besluitTypeWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import {
  besluitPluginCardWidget,
  besluitContextCardWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-plugin';
import { importSnippetWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/import-snippet-plugin';
import {
  rdfaDateCardWidget,
  rdfaDateInsertWidget,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';
import { standardTemplateWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin';
import { roadSignRegulationWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';
import { templateVariableWidget } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-variable-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { NodeViewConstructor } from '@lblod/ember-rdfa-editor';
import { setupCitationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { invisible_rdfa } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import sampleData from '@lblod/ember-rdfa-editor/config/sample-data';
const citation = setupCitationPlugin();
const nodes = {
  doc,
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
  block_rdfa,
  invisible_rdfa,
};
const marks = {
  citation: citation.marks.citation,
  inline_rdfa,
  link,
  em,
  strong,
  underline,
  strikethrough,
};
const dummySchema = new Schema({ nodes, marks });

export default class BesluitSampleController extends Controller {
  @service declare importRdfaSnippet: importRdfaSnippet;
  prefixes = {
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    dct: 'http://purl.org/dc/terms/',
    say: 'https://say.data.gift/ns/',
  };

  @tracked rdfaEditor?: ProseController;
  @tracked nodeViews: (
    controller: ProseController
  ) => Record<string, NodeViewConstructor> = () => {
    return {};
  };
  @tracked plugins: Plugin[] = [tablePlugin, citation.plugin];
  @tracked widgets: WidgetSpec[] = [
    tableMenu,
    besluitTypeWidget,
    besluitContextCardWidget(),
    besluitPluginCardWidget(),
    importSnippetWidget,
    rdfaDateCardWidget,
    rdfaDateInsertWidget,
    standardTemplateWidget,
    citation.widgets.citationCard,
    citation.widgets.citationInsert,
    roadSignRegulationWidget,
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
    const presetContent =
      `
    <div property="prov:generated" resource="http://data.lblod.info/id/besluiten/bb7ca791-7952-44dc-b191-bc87ef55ae2c" typeof="besluit:Besluit ext:BesluitNieuweStijl">
      <p>Openbare titel besluit:</p>
      <h4 class="h4" property="eli:title" datatype="xsd:string"><span class="mark-highlight-manual">Geef titel besluit op</span></h4>
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
        <h5>Bevoegdheid</h5>
        <ul class="bullet-list">
          <li><span class="mark-highlight-manual">Rechtsgrond die bepaalt dat dit orgaan bevoegd is.</span></li>
        </ul>
        <br>
        <h5>Juridische context</h5>
        <ul class="bullet-list">
          <li><span class="mark-highlight-manual">Voeg juridische context in</span></li>
        </ul>
        <br>
        <h5>Feitelijke context en argumentatie</h5>
        <ul class="bullet-list">
          <li><span class="mark-highlight-manual">Voeg context en argumentatie in</span></li>
        </ul>
      </div>
      <br>
      <br>
      <h5>Beslissing</h5>
      <div property="prov:value" datatype="xsd:string">
        <div property="eli:has_part" resource="http://data.lblod.info/artikels/1234" typeof="besluit:Artikel">
          <div>Artikel <span property="eli:number" datatype="xsd:string">1</span></div>
          <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
          <div property="prov:value" datatype="xsd:string">
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </div>
        </div>
        <br>
        <div class="mark-highlight-manual">Voeg nieuw artikel in</div> <!-- Plugin en rdfa nakijken -->
        <br>
      </div>
    </div>` +
      `
    <div property="prov:generated" resource="http://data.lblod.info/id/besluiten/bb7ca791-7952-44dc-b191" typeof="besluit:Besluit ext:BesluitNieuweStijl">
      <p>Openbare titel besluit:</p>
      <h4 class="h4" property="eli:title" datatype="xsd:string"><span class="mark-highlight-manual">Geef titel besluit op</span></h4>
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
        <h5>Bevoegdheid</h5>
        <ul class="bullet-list">
          <li><span class="mark-highlight-manual">Rechtsgrond die bepaalt dat dit orgaan bevoegd is.</span></li>
        </ul>
        <br>
        <h5>Juridische context</h5>
        <ul class="bullet-list">
          <li><span class="mark-highlight-manual">Voeg juridische context in</span></li>
        </ul>
        <br>
        <h5>Feitelijke context en argumentatie</h5>
        <ul class="bullet-list">
          <li><span class="mark-highlight-manual">Voeg context en argumentatie in</span></li>
        </ul>
      </div>
      <br>
      <br>
      <h5>Beslissing</h5>
      <div property="prov:value" datatype="xsd:string">
        <div property="eli:has_part" resource="http://data.lblod.info/artikels/12" typeof="besluit:Artikel">
          <div>Artikel <span property="eli:number" datatype="xsd:string">1</span></div>
          <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
          <div property="prov:value" datatype="xsd:string">
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </div>
        </div>
        <br>
        <div class="mark-highlight-manual">Voeg nieuw artikel in</div> <!-- Plugin en rdfa nakijken -->
        <br>
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
