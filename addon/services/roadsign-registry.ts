import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { generateMeasuresQuery } from '../plugins/roadsign-regulation-plugin/utils/fetchData';
import Instruction from '../models/instruction';
import Measure from '../models/measure';
import Sign from '../models/sign';
import { IBindings } from 'fetch-sparql-endpoint';
import dataFactory from '@rdfjs/data-model';
import { optionMapOr, unwrap } from '../utils/option';
import { sparqlEscapeString } from '../utils/sparql-helpers';

const PREFIXES = `
PREFIX ex: <http://example.org#>
PREFIX lblodMobiliteit: <http://data.lblod.info/vocabularies/mobiliteit/>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX oslo: <http://data.vlaanderen.be/ns#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>`;

const DEBOUNCE_MS = 100;

export default class RoadsignRegistryService extends Service {
  @tracked classifications: { value: string; label: string }[] = [];
  instructions: Map<string, Instruction[]> = new Map();

  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);
  }

  loadClassifications = task(async (endpoint: string) => {
    const result = await this.executeQuery.perform(
      `
    SELECT DISTINCT ?classificationUri ?classificationLabel  WHERE {
      ?measure ext:relation/ext:concept ?signUri.
      ?signUri org:classification ?classificationUri.
      ?classificationUri a mobiliteit:Verkeersbordcategorie;
        skos:prefLabel ?classificationLabel.
    }
`,
      endpoint,
    );
    const bindings = result.results.bindings;
    this.classifications = bindings.map((binding) => ({
      value: unwrap(binding['classificationUri']?.value),
      label: unwrap(binding['classificationLabel']?.value),
    }));
  });

  getInstructionsForMeasure = task(
    async (uri: string, endpoint: string): Promise<Instruction[]> => {
      if (this.instructions.has(uri)) {
        console.log("instructions", this.instructions);
        return unwrap(this.instructions.get(uri));
      } else {
        const instructions = await this.fetchInstructionsForMeasure.perform(
          uri,
          endpoint,
        );
        this.instructions.set(uri, instructions);
        return instructions;
      }
    },
  );

  searchCode = task(
    { restartable: true },
    async (
      endpoint: string,
      codeString?: string,
      category?: string,
      type?: string,
      combinedSigns?: string[],
    ) => {
      await timeout(DEBOUNCE_MS);
      if (!Array.isArray(combinedSigns)) {
        if (combinedSigns) combinedSigns = [combinedSigns];
        else combinedSigns = [];
      }
      let signFilter = '';
      if (combinedSigns.length > 0) {
        signFilter = combinedSigns
          .map((sign) => `?measure ext:relation/ext:concept <${sign}>.`)
          .join('\n');
        signFilter += '\n';
        const commaSeperatedSigns = combinedSigns
          .map((sign) => `<${sign}>`)
          .join(',');
        signFilter += `FILTER (?signUri NOT IN (${commaSeperatedSigns}))`;
      }

      const query = `
      SELECT DISTINCT ?signUri ?signCode WHERE {
        ?measure ext:relation/ext:concept ?signUri.
        ?signUri a ${type ? `<${type}>` : '?signType'};
          skos:prefLabel ?signCode;
          ext:valid "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>.
        ${category ? `?signUri org:classification <${category}>` : ''}
        ${
          type
            ? ''
            : `
          VALUES ?signType {
            <https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept>
            <https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept>
            <https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept>
          }
        `
        }
        ${signFilter}
        ${
          codeString
            ? `FILTER(CONTAINS(LCASE(?signCode), ${sparqlEscapeString(codeString.toLowerCase())}))`
            : ''
        }
      }
      ORDER BY ASC(?signCode)
    `;
      const result = await this.executeQuery.perform(query, endpoint);
      const codes = result.results.bindings.map((binding) => ({
        value: unwrap(binding['signUri']?.value),
        label: unwrap(binding['signCode']?.value),
      }));
      return codes;
    },
  );

  executeQuery = task(
    async (
      query: string,
      endpoint: string,
    ): Promise<{
      results: {
        bindings: IBindings[];
      };
    }> => {
      const encodedQuery = encodeURIComponent(`${PREFIXES}\n${query.trim()}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: {
          Accept: 'application/sparql-results+json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `query=${encodedQuery}`,
      });
      if (response.ok) {
        return response.json() as unknown as {
          results: {
            bindings: IBindings[];
          };
        };
      } else {
        throw new Error(
          `Request to MOW backend was unsuccessful: [${response.status}] ${response.statusText}`,
        );
      }
    },
  );

  fetchInstructionsForMeasure = task(
    async (uri: string, endpoint: string): Promise<Instruction[]> => {
      const query = `SELECT ?name ?template ?annotatedTemplate
           WHERE {
            <${uri}> ext:template/ext:mapping ?mapping.
          ?mapping ext:variableType 'instruction';
            ext:variable ?name;
            ext:instructionVariable ?instructionVariable.
          ?instructionVariable ext:annotated ?annotatedTemplate;
            ext:value ?template.
          }
          `;
      const result = await this.executeQuery.perform(query, endpoint);
      const instructions = result.results.bindings.map((binding) =>
        Instruction.fromBinding(binding),
      );
      return instructions;
    },
  );

  fetchMeasures = task(
    { restartable: true },
    async (
      endpoint: string,
      imageBaseUrl: string,
      {
        zonality,
        type,
        codes,
        category,
        pageStart,
      }: {
        zonality?: string;
        type?: string;
        codes?: string[];
        category?: string;
        pageStart?: number;
      } = {},
    ) => {
      const selectQuery = generateMeasuresQuery({
        zonality,
        type,
        codes,
        category,
        pageStart,
      });
      const countQuery = generateMeasuresQuery({
        zonality,
        type,
        codes,
        category,
        count: true,
      });
      const countResult = await this.executeQuery.perform(countQuery, endpoint);

      const count = optionMapOr(
        0,
        parseInt,
        countResult.results.bindings[0]?.['count']?.value,
      );
      const measures = [];
      const result = await this.executeQuery.perform(selectQuery, endpoint);
      for (const binding of result.results.bindings) {
        const measure = Measure.fromBinding(binding);
        measure.signs = await this.fetchSignsForMeasure.perform(
          measure.uri,
          endpoint,
          imageBaseUrl,
        );
        measure.classifications = makeClassificationSet(measure.signs);
        measures.push(measure);
      }
      return { measures, count };
    },
  );

  fetchSignsForMeasure = task(
    async (uri: string, endpoint: string, imageBaseUrl: string) => {
      const query = `
        SELECT ?relatedTrafficSignConcepts ?code ?image ?zonality  (GROUP_CONCAT(?classification; SEPARATOR="|") AS ?classifications)
          WHERE {
              ?relatedTrafficSignConcepts mobiliteit:heeftMaatregelconcept <${uri}>.
              ?relatedTrafficSignConcepts a mobiliteit:Verkeerstekenconcept;
                        skos:prefLabel ?code;
                        mobiliteit:grafischeWeergave ?imageSrc.
              ?imageSrc ext:hasFile/mu:uuid ?image.
              OPTIONAL {
                  ?relatedTrafficSignConcepts ext:zonality ?zonality.
              }
              OPTIONAL {
                ?relatedTrafficSignConcepts dct:type/skos:prefLabel ?classification.
              }
       }
`;
      const result = await this.executeQuery.perform(query, endpoint);
      const signs = [];
      console.log(result.results);
      for (const binding of result.results.bindings) {
        const sign = Sign.fromBinding({
          ...binding,
          imageBaseUrl: dataFactory.namedNode(imageBaseUrl),
        });
        signs.push(sign);
      }
      return signs;
    },
  );
}

function makeClassificationSet(signs: Iterable<Sign>) {
  const classifications = new Set();
  for (const sign of signs) {
    for (const c of sign.classifications) {
      classifications.add(c);
    }
  }
  sortSet(classifications);
  return classifications;
}

function sortSet<T>(set: Set<T>) {
  const entries = [];
  for (const member of set) {
    entries.push(member);
  }
  set.clear();
  for (const entry of entries.sort()) {
    set.add(entry);
  }
  return set;
}
