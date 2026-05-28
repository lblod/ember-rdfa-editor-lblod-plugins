import { EditorState } from '@lblod/ember-rdfa-editor';
import { Area, Place } from './geo-helpers';
import { Address } from './address-helpers';

type LocationsWithDistanceType = {
  location: Place | Address | Area;
  distance: number;
};

type LocationMetadataType = {
  [locationUri: string]: { ocurrences: number; distance: number };
};

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
  const locationsDedup: (Place | Address | Area)[] = [];
  for (const locationWithDistance of locationsWithDistance) {
    const uri =
      (locationWithDistance.location as Address).belgianAddressUri ||
      locationWithDistance.location.uri;
    if (!locationMetadata[uri]) {
      locationMetadata[uri] = {
        ocurrences: 1,
        distance: locationWithDistance.distance,
      };
      locationsDedup.push(locationWithDistance.location);
    } else {
      locationMetadata[uri].ocurrences++;
      if (locationWithDistance.distance < locationMetadata[uri].distance) {
        locationMetadata[uri].distance = locationWithDistance.distance;
      }
    }
  }

  const locations = locationsDedup.sort((a, b) => {
    const uriA = (a as Address).belgianAddressUri || a.uri;
    const uriB = (b as Address).belgianAddressUri || b.uri;
    if (
      locationMetadata[uriA].ocurrences === locationMetadata[uriB].ocurrences
    ) {
      return locationMetadata[uriA].distance - locationMetadata[uriB].distance;
    } else {
      return (
        locationMetadata[uriB].ocurrences - locationMetadata[uriA].ocurrences
      );
    }
  });
  return locations;
}
