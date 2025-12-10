import {
  executeQuery,
  QueryResult,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';

export type CodeListOptions = {
  type: string;
  options: CodeListOption[];
};

export type CodeListOption = {
  uri: string;
  label: string;
};

function generateCodeListOptionsQuery(codelistUri: string): string {
  const codeListOptionsQuery = /* sparql */ `
    PREFIX lblodMobiliteit: <http://data.lblod.info/vocabularies/mobiliteit/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX schema: <http://schema.org/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    SELECT DISTINCT ?codelistOption ?label ?type ?position WHERE {
      <${codelistUri}> a lblodMobiliteit:Codelist.
      ?codelistOption skos:inScheme <${codelistUri}>.
      ?codelistOption skos:prefLabel ?label.
      OPTIONAL {
        ?codelistOption schema:position ?position .
      }
      OPTIONAL {
        <${codelistUri}> dct:type ?type.
      }
    }
    ORDER BY (!BOUND(?position)) ASC(?position)
  `;
  return codeListOptionsQuery;
}

export async function fetchCodeListOptions(
  endpoint: string,
  codelistUri: string,
): Promise<CodeListOptions> {
  const codelistsOptionsQueryResult = await executeQuery({
    endpoint,
    query: generateCodeListOptionsQuery(codelistUri),
  });
  const options = parseCodelistOptions(codelistsOptionsQueryResult);
  return {
    type:
      (codelistsOptionsQueryResult.results.bindings[0] &&
        codelistsOptionsQueryResult.results.bindings[0]['type']?.value) ||
      '',
    options,
  };
}

export async function fetchCodelistOption(
  endpoint: string,
  codelistOptionUri: string,
): Promise<Required<CodeListOption> | undefined> {
  const response = await executeQuery({
    endpoint,
    query: /* sparql */ `
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      SELECT DISTINCT ?label WHERE {
        ${sparqlEscapeUri(codelistOptionUri)}
          skos:prefLabel ?label.
      }
    `,
  });
  const bindings = response.results.bindings;
  if (!bindings.length) {
    return;
  }
  return {
    uri: codelistOptionUri,
    label: bindings[0]['label'].value,
  };
}

function parseCodelistOptions(queryResult: QueryResult): CodeListOption[] {
  const bindings = queryResult.results.bindings;
  return bindings.map((binding) => ({
    uri: binding['codelistOption'].value,
    label: binding['label'].value,
  }));
}

export type CodeList = {
  uri?: string;
  label?: string;
};

function generateCodeListsByPublisherQuery(publisher?: string): string {
  const codeListOptionsQuery = `
    PREFIX lblodMobilitiet: <http://data.lblod.info/vocabularies/mobiliteit/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    SELECT DISTINCT * WHERE {
      ?uri a lblodMobilitiet:Codelist;
        skos:prefLabel ?label.
      ${
        publisher
          ? `
        ?uri dct:publisher <${publisher}>.
      `
          : ''
      }
    }
  `;
  return codeListOptionsQuery;
}

export async function fetchCodeListsByPublisher(
  endpoint: string,
  publisher?: string,
): Promise<CodeList[]> {
  const codelistsOptionsQueryResult = await executeQuery({
    endpoint,
    query: generateCodeListsByPublisherQuery(publisher),
  });
  const bindings = codelistsOptionsQueryResult.results.bindings;
  return bindings.map((binding) => ({
    uri: binding['uri'].value,
    label: binding['label'].value,
  }));
}
