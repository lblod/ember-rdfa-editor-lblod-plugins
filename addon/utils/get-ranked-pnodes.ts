import { EditorState, type PNode } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

type NodeMetadataType = {
  [uri: string]: {
    node: ResolvedPNode;
    occurrences: number;
    distance: number;
  };
};

const PROXIMITY_WEIGHT = 0.8;
const FREQUENCY_WEIGHT = 1 - PROXIMITY_WEIGHT;
const PROXIMITY_DECAY = 50;

/**
 * Returns a frequency score that normalizes logarithmically to avoid domination by a few very large occurences.
 * @param occurences amount of occurences of the location
 * @param maxOccurences max amount of occurences for any location
 */
function getFrequencyScore(occurences: number, maxOccurences: number) {
  return Math.log(occurences + 1) / Math.log(maxOccurences + 1);
}

/**
 * Uses exponential decay to calculate a proximity score
 * @param distance Distance from the selection
 * @returns proximity score
 */
function getProximityScore(distance: number) {
  return Math.exp(-distance / PROXIMITY_DECAY);
}

function getSuggestionScore(
  occurrences: number,
  maxOccurences: number,
  distance: number,
) {
  const score =
    PROXIMITY_WEIGHT * getProximityScore(distance) +
    FREQUENCY_WEIGHT * getFrequencyScore(occurrences, maxOccurences);

  return score;
}

export function getRankedPNodes(
  state: EditorState,
  nodeType: string,
  getUri: (node: PNode) => string,
): {
  node: ResolvedPNode;
  score: number;
}[] {
  const doc = state.doc;
  const nodesWithDistance: { node: ResolvedPNode; distance: number }[] = [];
  const selection = state.selection;
  doc.descendants((node, pos) => {
    if (node.type.name === nodeType) {
      const distance = Math.abs(pos - selection.from);
      nodesWithDistance.push({
        node: { value: node, pos },
        distance: distance,
      });
      return false;
    }
    return true;
  });
  const nodeMetadata: NodeMetadataType = {};
  for (const nodeWithDistance of nodesWithDistance) {
    const { node, distance } = nodeWithDistance;
    const uri = getUri(node.value);
    if (!uri) {
      continue;
    }
    if (!nodeMetadata[uri]) {
      nodeMetadata[uri] = {
        node,
        occurrences: 1,
        distance,
      };
    } else {
      nodeMetadata[uri].occurrences++;
      if (distance < nodeMetadata[uri].distance) {
        nodeMetadata[uri].distance = distance;
      }
    }
  }

  const maxOccurence = Object.values(nodeMetadata).reduce(
    (acc, { occurrences: ocurrences }) =>
      acc >= ocurrences ? acc : ocurrences,
    1,
  );

  const scoredNodes = Object.values(nodeMetadata).map(
    ({ node, occurrences, distance }) => ({
      node,
      score: getSuggestionScore(occurrences, maxOccurence, distance),
      occurrences,
      distance,
    }),
  );

  scoredNodes.sort(({ score: scoreA }, { score: scoreB }) => {
    return scoreB - scoreA;
  });

  return scoredNodes;
}
