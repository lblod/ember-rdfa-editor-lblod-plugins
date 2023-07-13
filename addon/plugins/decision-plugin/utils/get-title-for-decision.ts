import { SayStore } from '@lblod/ember-rdfa-editor/plugins/datastore';

export function getTitleForDecision(decisionUri: string, datastore: SayStore) {
  const title = datastore
    .match(`>${decisionUri}`, '>http://data.europa.eu/eli/ontology#title')
    .asQuads()
    .next().value;

  return !!title;
}

/**
 * Gets all nodes defining a eli:title predicate for a certain
 * decision subject URI
 * @param decisionUri
 * @param datastore
 * @returns {null|*}
 */
export function getTitleNodesForDecision(
  decisionUri: string,
  datastore: SayStore,
) {
  const mapping = datastore
    .match(`>${decisionUri}`, '>http://data.europa.eu/eli/ontology#title')
    .asPredicateNodeMapping()
    .single();
  if (mapping) {
    return mapping.nodes;
  } else {
    return null;
  }
}
