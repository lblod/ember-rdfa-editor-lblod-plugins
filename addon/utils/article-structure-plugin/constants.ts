import IntlService from 'ember-intl/services/intl';
import romanize from '../romanize';

export type Structure = {
  uriBase: string;
  title: string;
  type: string;
  numberPredicate: string;
  numbering?: string;
  numberingFunction?: (num: number) => string;
  heading?: string;
  translation: string;
  moveUp: string;
  moveDown: string;
  insertPredicate: string;
  shaclConstraint: string;
  template: (uri: string, intlService: IntlService) => string;
};

export const STRUCTURES: Record<string, Structure> = {
  title: {
    uriBase: 'http://data.lblod.info/titles/',
    title: 'Title',
    type: 'https://say.data.gift/ns/Title',
    numberPredicate: 'http://data.europa.eu/eli/ontology#number',
    numberingFunction: romanize,
    heading: 'h3',
    translation: 'article-structure-plugin.insert.title',
    moveUp: 'article-structure-plugin.moveUp.title',
    moveDown: 'article-structure-plugin.moveDown.title',
    insertPredicate: 'http://www.w3.org/ns/prov#value',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <http://data.vlaanderen.be/ns/besluit#Besluit>
        ].
      `,
    template: (uri, intlService) => `
    <div 
      property="say:hasPart" 
      typeof="https://say.data.gift/ns/Title https://say.data.gift/ns/ArticleContainer" 
      resource="${uri}"
    >
      <h4 property="say:heading">
        <span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span property="ext:title"><span class="mark-highlight-manual">${intlService.t(
          'article-structure-plugin.placeholder.title'
        )}</span></span>
      </h4>
      <div property="say:body" datatype='rdf:XMLLiteral'>
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    </div>`,
  },
  chapter: {
    uriBase: 'http://data.lblod.info/chapters/',
    title: 'Chapter',
    type: 'https://say.data.gift/ns/Chapter',
    numberPredicate: 'http://data.europa.eu/eli/ontology#number',
    numberingFunction: romanize,
    translation: 'article-structure-plugin.insert.chapter',
    moveUp: 'article-structure-plugin.moveUp.chapter',
    moveDown: 'article-structure-plugin.moveDown.chapter',
    insertPredicate: 'https://say.data.gift/ns/body',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <https://say.data.gift/ns/Title>
        ].
      `,
    template: (uri, intlService) => `
    <div 
      property="say:hasPart" 
      typeof="https://say.data.gift/ns/Chapter https://say.data.gift/ns/ArticleContainer" 
      resource="${uri}"
    >
      <h4 property="say:heading">
        <span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span property="ext:title"><span class="mark-highlight-manual">${intlService.t(
          'article-structure-plugin.placeholder.chapter'
        )}</span></span>
      </h4>
      <div property="say:body" datatype='rdf:XMLLiteral'>
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    </div>`,
  },
  section: {
    uriBase: 'http://data.lblod.info/sections/',
    title: 'Section',
    heading: 'h5',
    type: 'https://say.data.gift/ns/Section',
    numberPredicate: 'http://data.europa.eu/eli/ontology#number',
    numberingFunction: romanize,
    translation: 'article-structure-plugin.insert.heading',
    moveUp: 'article-structure-plugin.moveUp.section',
    moveDown: 'article-structure-plugin.moveDown.section',
    insertPredicate: 'https://say.data.gift/ns/body',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <https://say.data.gift/ns/Chapter>
        ].
      `,
    template: (uri, intlService) => `
    <div 
      property="say:hasPart" 
      typeof="https://say.data.gift/ns/Section https://say.data.gift/ns/ArticleContainer" 
      resource="${uri}"
    >
      <h5 property="say:heading">
        <span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span property="ext:title"><span class="mark-highlight-manual">${intlService.t(
          'article-structure-plugin.placeholder.section'
        )}</span></span>
      </h5>
      <div property="say:body" datatype='rdf:XMLLiteral'>
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    </div>`,
  },
  subsection: {
    uriBase: 'http://data.lblod.info/subsections/',
    title: 'Subsection',
    heading: 'h6',
    type: 'https://say.data.gift/ns/Subsection',
    numberingFunction: romanize,
    numberPredicate: 'http://data.europa.eu/eli/ontology#number',
    translation: 'article-structure-plugin.insert.subsection',
    moveUp: 'article-structure-plugin.moveUp.subsection',
    moveDown: 'article-structure-plugin.moveDown.subsection',
    insertPredicate: 'https://say.data.gift/ns/body',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <https://say.data.gift/ns/Section>
        ].
      `,
    template: (uri, intlService) => `
    <div 
      property="say:hasPart" 
      typeof="https://say.data.gift/ns/Subsection https://say.data.gift/ns/ArticleContainer" 
      resource="${uri}"
    >
      <h6 property="say:heading">
        <span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span property="ext:title"><span class="mark-highlight-manual">${intlService.t(
          'article-structure-plugin.placeholder.subsection'
        )}</span></span>
      </h6>
      <div property="say:body" datatype='rdf:XMLLiteral'>
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    </div>`,
  },
  article: {
    uriBase: 'http://data.lblod.info/artikels/',
    title: 'Article',
    translation: 'article-structure-plugin.insert.article',
    moveUp: 'article-structure-plugin.moveUp.article',
    moveDown: 'article-structure-plugin.moveDown.article',
    type: 'http://data.vlaanderen.be/ns/besluit#Artikel',
    numberPredicate: 'http://data.europa.eu/eli/ontology#number',
    insertPredicate: 'https://say.data.gift/ns/body',
    numbering: 'continuous',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
                  sh:path <https://say.data.gift/ns/hasPart> ;
                  sh:class <http://data.vlaanderen.be/ns/besluit#Artikel>
        ];
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <https://say.data.gift/ns/ArticleContainer>
        ].
      `,
    template: (uri) => `
      <div property="say:hasPart" typeof="http://data.vlaanderen.be/ns/besluit#Artikel" resource="${uri}">
        <div property="say:heading">
          Artikel 
          <span property="eli:number" datatype="xsd:string"> 
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </span>
          :
          <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
        </div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div property="say:body" datatype='rdf:XMLLiteral'>
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </div>
      </div>
    
    `,
  },
  paragraph: {
    uriBase: 'http://data.lblod.info/paragraphs/',
    title: 'Paragraph',
    translation: 'article-structure-plugin.insert.paragraph',
    moveUp: 'article-structure-plugin.moveUp.paragrah',
    moveDown: 'article-structure-plugin.moveDown.paragrah',
    type: 'https://say.data.gift/ns/Paragraph',
    numberPredicate: 'http://data.europa.eu/eli/ontology#number',
    insertPredicate: 'https://say.data.gift/ns/body',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ParagraphShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <http://data.vlaanderen.be/ns/besluit#Artikel>
        ].
      `,
    template: (uri) => `
      <div property="say:hasParagraph" typeof="say:Paragraph" resource="${uri}">
        §<span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    `,
  },
};
