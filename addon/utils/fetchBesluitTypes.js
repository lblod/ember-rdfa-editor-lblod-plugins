import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';

export default async function fetchBesluitTypes(classificationUri, ENV) {
  const query = `
    PREFIX                    conceptscheme: <https://data.vlaanderen.be/id/conceptscheme/>
    PREFIX                      BesluitType: <https://data.vlaanderen.be/id/concept/BesluitType/>
    PREFIX              BesluitDocumentType: <https://data.vlaanderen.be/id/concept/BesluitDocumentType/>
    PREFIX                             skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX                              xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX                              rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX                             core: <http://mu.semte.ch/vocabularies/core/>
    PREFIX                          besluit: <http://lblod.data.gift/vocabularies/besluit/>
    PREFIX BestuurseenheidClassificatieCode: <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/>
    PREFIX                              sch: <http://schema.org/>
    PREFIX                             rule: <http://lblod.data.gift/vocabularies/notification/>
    PREFIX                        lblodRule: <http://data.lblod.info/id/notification-rule/>

    SELECT ?s ?p ?o WHERE {
      ?s skos:inScheme conceptscheme:BesluitType ;
         besluit:notificationRule ?rule .
      ?rule besluit:decidableBy <${classificationUri}> .
      OPTIONAL { ?rule sch:validFrom ?validFrom . }
      OPTIONAL { ?rule sch:validThrough ?validThrough . }
      BIND(now() AS ?currentTime) .
      BIND(STRLEN(STR(?validFrom)) > 0 AS ?validFromExists) .
      BIND(STRLEN(STR(?validThrough)) > 0 AS ?validThroughExists) .
      FILTER(
        ((?validFromExists && ?validThroughExists) && (?currentTime < ?validThrough && ?currentTime >= ?validFrom)) ||
        ((!?validFromExists && ?validThroughExists) && (?currentTime < ?validThrough)) ||
        ((?validFromExists && !?validThroughExists) && (?currentTime >= ?validFrom))
      ) .
      ?s ?p ?o .
      VALUES ?p {
        skos:prefLabel
        skos:definition
        skos:broader
      }
    }
  `;
  const typeFetcher = new SparqlEndpointFetcher({
    method: 'POST',
  });
  const endpoint = ENV.besluitTypePlugin.endpoint;
  const bindingStream = await typeFetcher.fetchBindings(endpoint, query);
  const validBesluitTriples = [];
  bindingStream.on('data', (triple) => {
    validBesluitTriples.push(triple);
  });
  return new Promise((resolve, reject) => {
    bindingStream.on('error', reject);
    bindingStream.on('end', () => {
      resolve(validBesluitTriples);
    });
  }).then(quadsToBesluitTypeObjects);
}

function quadsToBesluitTypeObjects(triples) {
  const besluitTypes = new Map();
  triples.forEach((triple) => {
    const existing = besluitTypes.get(triple.s.value) || {
      uri: triple.s.value,
    };
    switch (triple.p.value) {
      case 'http://www.w3.org/2004/02/skos/core#definition':
        existing.definition = triple.o.value;
        break;
      case 'http://www.w3.org/2004/02/skos/core#prefLabel':
        existing.label = triple.o.value;
        break;
      case 'http://www.w3.org/2004/02/skos/core#broader':
        existing.broader = triple.o.value;
        break;
    }
    besluitTypes.set(triple.s.value, existing);
  });
  return createBesluitTypeObjectsHierarchy([...besluitTypes.values()]);
}

function createBesluitTypeObjectsHierarchy(allBesluitTypes) {
  const besluitTypes = allBesluitTypes.filter((bst) => !bst.broader);
  const subTypes = allBesluitTypes.filter((bst) => !!bst.broader);
  subTypes.forEach((subtype) => {
    //Use allBesluitTypes to find the parent. This means no tree recursive search process, but we can still create trees of multiple levels deep.
    const parent = allBesluitTypes.find((type) => type.uri === subtype.broader);
    if (parent)
      if (parent.subTypes) parent.subTypes.push(subtype);
      else parent.subTypes = [subtype];
  });
  return besluitTypes;
}
