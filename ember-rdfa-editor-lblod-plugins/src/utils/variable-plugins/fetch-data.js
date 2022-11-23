function generateCodeListOptionsQuery(codelistUri) {
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

function generateCodeListsByPublisherQuery(publisher) {
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

export async function fetchCodeListOptions(endpoint, codelistUri) {
  const codelistsOptionsQueryResult = await executeQuery(
    endpoint,
    generateCodeListOptionsQuery(codelistUri)
  );
  const options = parseCodelistOptions(codelistsOptionsQueryResult);
  return {
    type:
      codelistsOptionsQueryResult.results.bindings[0] &&
      codelistsOptionsQueryResult.results.bindings[0].type
        ? codelistsOptionsQueryResult.results.bindings[0].type.value
        : '',
    options,
  };
}

export async function fetchCodeListsByPublisher(endpoint, publisher) {
  const codelistsOptionsQueryResult = await executeQuery(
    endpoint,
    generateCodeListsByPublisherQuery(publisher)
  );
  const bindings = codelistsOptionsQueryResult.results.bindings;
  return bindings.map((binding) => ({
    uri: binding.uri.value,
    label: binding.label.value,
  }));
}

function parseCodelistOptions(queryResult) {
  const bindings = queryResult.results.bindings;
  return bindings.map((binding) => ({
    value: binding.label.value,
    label: binding.label.value,
  }));
}

async function executeQuery(endpoint, query) {
  const encodedQuery = encodeURIComponent(query.trim());
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
    return response.json();
  } else {
    throw new Error(
      `Request to MOW backend was unsuccessful: [${response.status}] ${response.statusText}`
    );
  }
}
