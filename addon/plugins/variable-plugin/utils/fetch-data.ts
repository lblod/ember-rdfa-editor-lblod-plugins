import {
  executeQuery,
  QueryResult,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';

export type CodeListOptions = {
  type: string;
  options: CodeListOption[];
};

export type CodeListOption = {
  value?: string;
  label?: string;
};

function generateCodeListOptionsQuery(codelistUri: string): string {
  const codeListOptionsQuery = `
    PREFIX lblodMobilitiet: <http://data.lblod.info/vocabularies/mobiliteit/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX schema: <http://schema.org/>
    SELECT DISTINCT * WHERE { 
      <${codelistUri}> a lblodMobilitiet:Codelist.
      ?codelistOptions skos:inScheme <${codelistUri}>.
      ?codelistOptions skos:prefLabel ?label.
      OPTIONAL {
        ?codelistOptions schema:position ?position .
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
  codelistUri: string
): Promise<CodeListOptions> {
  const codelistsOptionsQueryResult = await executeQuery(
    endpoint,
    generateCodeListOptionsQuery(codelistUri)
  );
  const options = parseCodelistOptions(codelistsOptionsQueryResult);
  return {
    type:
      (codelistsOptionsQueryResult.results.bindings[0] &&
        codelistsOptionsQueryResult.results.bindings[0]['type']?.value) ||
      '',
    options,
  };
}

function parseCodelistOptions(queryResult: QueryResult): CodeListOption[] {
  const bindings = queryResult.results.bindings;
  return bindings.map((binding) => ({
    value: binding['label']?.value,
    label: binding['label']?.value,
  }));
}

export type CodeList = {
  uri?: string;
  label?: string;
};

function generateCodeListsByPublisherQuery(publisher: string): string {
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
  publisher: string
): Promise<CodeList[]> {
  const codelistsOptionsQueryResult = await executeQuery(
    endpoint,
    generateCodeListsByPublisherQuery(publisher)
  );
  const bindings = codelistsOptionsQueryResult.results.bindings;
  return bindings.map((binding) => ({
    uri: binding['uri']?.value,
    label: binding['label']?.value,
  }));
}
