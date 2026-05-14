import { SayController } from '@lblod/ember-rdfa-editor';
import { Area, Place } from './geo-helpers';
import { Address } from './address-helpers';

type locationsWithDistanceType = {
  location: Place | Address | Area;
  distance: number;
};

type locationMetadataType = {
  [locationUri: string]: { ocurrences: number; distance: number };
};

export default function getDocumentLocations(controller: SayController) {
  const state = controller.mainEditorState;
  const doc = state.doc;
  const locationsWithDistance: locationsWithDistanceType[] = [];
  const { selection } = controller.mainEditorState;
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
  const locationMetadata: locationMetadataType = {};
  const locationsDedup: locationsWithDistanceType[] = [];
  for (const locationWithDistance of locationsWithDistance) {
    const uri =
      (locationWithDistance.location as Address).belgianAddressUri ||
      locationWithDistance.location.uri;
    if (!locationMetadata[uri]) {
      locationMetadata[uri] = {
        ocurrences: 1,
        distance: locationWithDistance.distance,
      };
      locationsDedup.push(locationWithDistance);
    } else {
      locationMetadata[uri].ocurrences++;
      if (locationWithDistance.distance < locationMetadata[uri].distance) {
        locationMetadata[uri].distance = locationWithDistance.distance;
      }
    }
  }

  const locations = locationsDedup
    .sort((a, b) => {
      const uriA = (a.location as Address).belgianAddressUri || a.location.uri;
      const uriB = (b.location as Address).belgianAddressUri || b.location.uri;
      if (
        locationMetadata[uriA].ocurrences === locationMetadata[uriB].ocurrences
      ) {
        return (
          locationMetadata[uriA].distance - locationMetadata[uriB].distance
        );
      } else {
        return (
          locationMetadata[uriB].ocurrences - locationMetadata[uriA].ocurrences
        );
      }
    })
    .map((locationWithPos) => locationWithPos.location);
  return locations;
}
