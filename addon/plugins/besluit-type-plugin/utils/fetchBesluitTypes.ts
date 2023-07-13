import { IBindings, SparqlEndpointFetcher } from 'fetch-sparql-endpoint';

export type BesluitType = {
  uri: string;
  definition: string;
  label: string;
  broader: string;
  subTypes?: BesluitType[];
};
export default async function fetchBesluitTypes(
  classificationUri: string,
  endpoint: string,
) {
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
  const bindingStream = await typeFetcher.fetchBindings(endpoint, query);
  const validBesluitTriples: IBindings[] = [];
  bindingStream.on('data', (triple: IBindings) => {
    validBesluitTriples.push(triple);
  });
  return new Promise<IBindings[]>((resolve, reject) => {
    bindingStream.on('error', reject);
    bindingStream.on('end', () => {
      resolve(validBesluitTriples);
    });
  }).then(quadsToBesluitTypeObjects);
}

function quadsToBesluitTypeObjects(triples: IBindings[]) {
  const besluitTypes = new Map<string, BesluitType>();
  triples.forEach((triple) => {
    const subject = triple['s'];
    const predicate = triple['p'];
    const object = triple['o'];
    const existing =
      besluitTypes.get(subject.value) ||
      ({
        uri: subject.value,
      } as BesluitType);
    switch (predicate.value) {
      case 'http://www.w3.org/2004/02/skos/core#definition':
        existing.definition = object.value;
        break;
      case 'http://www.w3.org/2004/02/skos/core#prefLabel':
        existing.label = object.value;
        break;
      case 'http://www.w3.org/2004/02/skos/core#broader':
        existing.broader = object.value;
        break;
    }
    besluitTypes.set(subject.value, existing);
  });
  return createBesluitTypeObjectsHierarchy([...besluitTypes.values()]);
}

function createBesluitTypeObjectsHierarchy(allBesluitTypes: BesluitType[]) {
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
