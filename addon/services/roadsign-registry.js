import Service from '@ember/service';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { generateMeasuresQuery } from '../utils/roadsign-regulation-plugin/fetchData';
import Instruction from '../models/instruction';
import Measure from '../models/measure';
import Sign from '../models/sign';

const PREFIXES = `
PREFIX ex: <http://example.org#>
PREFIX lblodMobiliteit: <http://data.lblod.info/vocabularies/mobiliteit/>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX oslo: <http://data.vlaanderen.be/ns#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
`;

const DEBOUNCE_MS = 100;

export default class RoadsignRegistryService extends Service {
  @tracked classifications = [];
  instructions = new Map();

  constructor() {
    super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
    this.imageBaseUrl = config.roadsignRegulationPlugin.imageBaseUrl;
    this.endpoint = config.roadsignRegulationPlugin.endpoint;
    this.loadClassifications.perform();
  }

  @task
  *loadClassifications() {
    const result = yield this.executeQuery.perform(`
    SELECT DISTINCT ?classificationUri ?classificationLabel  WHERE {
      ?measure ext:relation/ext:concept ?signUri.
      ?signUri org:classification ?classificationUri.
      ?classificationUri a mobiliteit:Verkeersbordcategorie;
        skos:prefLabel ?classificationLabel.
    }
`);
    const bindings = result.results.bindings;
    this.classifications = bindings.map((binding) => ({
      value: binding.classificationUri.value,
      label: binding.classificationLabel.value,
    }));
  }

  @task
  *getInstructionsForMeasure(uri) {
    if (this.instructions.has(uri)) {
      return this.instructions.get(uri);
    } else {
      const instructions = yield this.fetchInstructionsForMeasure.perform(uri);
      this.instructions.set(uri, instructions);
      return instructions;
    }
  }

  @restartableTask
  *searchCode(codeString, category, type, combinedSigns) {
    yield timeout(DEBOUNCE_MS);
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
            ? `FILTER(CONTAINS(LCASE(?signCode), "${codeString.toLowerCase()}"))`
            : ''
        }
      }
      ORDER BY ASC(?signCode)
    `;
    const result = yield this.executeQuery.perform(query);
    const codes = result.results.bindings.map((binding) => ({
      value: binding.signUri.value,
      label: binding.signCode.value,
    }));
    return codes;
  }

  @task
  *executeQuery(query) {
    const encodedQuery = encodeURIComponent(`${PREFIXES}\n${query.trim()}`);
    const response = yield fetch(this.endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `query=${encodedQuery}`,
    });
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(
        `Request to MOW backend was unsuccessful: [${response.status}] ${response.statusText}`
      );
    }
  }

  @task
  *fetchInstructionsForMeasure(uri) {
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
    const result = yield this.executeQuery.perform(query);
    const instructions = result.results.bindings.map((binding) =>
      Instruction.fromBinding(binding)
    );
    return instructions;
  }
  @restartableTask
  *fetchMeasures({ zonality, type, codes, category, pageStart } = {}) {
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
    const countResult = yield this.executeQuery.perform(countQuery);
    const count =
      countResult.results.bindings.length == 1
        ? Number(countResult.results.bindings[0].count.value)
        : 0;
    const measures = [];
    const result = yield this.executeQuery.perform(selectQuery);
    for (const binding of result.results.bindings) {
      const measure = Measure.fromBinding(binding);
      measure.signs = yield this.fetchSignsForMeasure.perform(measure.uri);
      measure.classifications = makeClassificationSet(measure.signs);
      measures.push(measure);
    }
    return { measures, count };
  }

  @task
  *fetchSignsForMeasure(uri) {
    const query = `
SELECT ?uri ?code ?image ?zonality ?order (GROUP_CONCAT(?classification; SEPARATOR="|") AS ?classifications)
WHERE {
  <${uri}> ext:relation ?relation.
  ?relation a ext:MustUseRelation;
            <http://purl.org/linked-data/cube#order> ?order;
            ext:concept ?uri.
  ?uri a ?type;
        skos:prefLabel ?code;
        ext:zonality ?zonality;
        mobiliteit:grafischeWeergave ?image.
  OPTIONAL {
    ?uri org:classification/skos:prefLabel ?classification.
  }
  } ORDER BY ASC(?order)
`;
    const result = yield this.executeQuery.perform(query);
    const signs = [];
    for (const binding of result.results.bindings) {
      const sign = Sign.fromBinding({
        ...binding,
        imageBaseUrl: this.imageBaseUrl,
      });
      signs.push(sign);
    }
    return signs;
  }
}

function makeClassificationSet(signs) {
  const classifications = new Set();
  for (const sign of signs) {
    for (const c of sign.classifications) {
      classifications.add(c);
    }
  }
  sortSet(classifications);
  return classifications;
}

function sortSet(set) {
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
