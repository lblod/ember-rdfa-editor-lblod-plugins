import { executeQuery } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
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
