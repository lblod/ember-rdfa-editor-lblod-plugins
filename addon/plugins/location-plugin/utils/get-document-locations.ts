import { EditorState } from '@lblod/ember-rdfa-editor';
import { Area, Place } from './geo-helpers';
import { Address } from './address-helpers';
import { getLocationUri } from '../_private/utils/location-helpers';

type LocationsWithDistanceType = {
  location: Place | Address | Area;
  distance: number;
};

type LocationMetadataType = {
  [locationUri: string]: {
    occurrences: number;
    distance: number;
    location: Address | Place | Area;
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

export default function getDocumentLocations(state: EditorState) {
  const doc = state.doc;
  const locationsWithDistance: LocationsWithDistanceType[] = [];
  const selection = state.selection;
  doc.descendants((node, pos) => {
    if (node.type.name === 'oslo_location') {
      const distance = Math.abs(pos - selection.from);
      locationsWithDistance.push({
        location: node.attrs.value,
        distance: distance,
      });
      return false;
    }
    return true;
  });
  const locationMetadata: LocationMetadataType = {};
  for (const locationWithDistance of locationsWithDistance) {
    const { location, distance } = locationWithDistance;
    if (!location) {
      continue;
    }
    const uri = getLocationUri(location);
    if (!locationMetadata[uri]) {
      locationMetadata[uri] = {
        location,
        occurrences: 1,
        distance,
      };
    } else {
      locationMetadata[uri].occurrences++;
      if (distance < locationMetadata[uri].distance) {
        locationMetadata[uri].distance = distance;
      }
    }
  }

  const maxOccurence = Object.values(locationMetadata).reduce(
    (acc, { occurrences: ocurrences }) =>
      acc >= ocurrences ? acc : ocurrences,
    1,
  );

  const scoredLocations = Object.values(locationMetadata).map(
    ({ location, occurrences, distance }) => ({
      location,
      score: getSuggestionScore(occurrences, maxOccurence, distance),
      occurrences,
      distance,
    }),
  );

  scoredLocations.sort(({ score: scoreA }, { score: scoreB }) => {
    return scoreB - scoreA;
  });

  return scoredLocations.map(({ location }) => location);
}
