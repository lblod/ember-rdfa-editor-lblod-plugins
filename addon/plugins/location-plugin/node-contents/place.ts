import {
  DCT,
  LOCN,
  RDFS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findChildWithRdfaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import { Place } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { constructPointSpec } from './point';
import { type NodeContentsUtils } from './';

export const constructPlaceSpec = (place: Place) => {
  return span(
    {
      resource: place.uri,
      typeof: LOCN('Location').full,
      property: DCT('spatial').full,
    },
    span(
      {
        property: RDFS('label').full,
      },
      place.name,
    ),
    constructPointSpec(place.location, LOCN('geometry')),
  );
};

export const parsePlaceElement =
  (nodeContentsUtils: NodeContentsUtils) =>
  (element: Element): Place | undefined => {
    const placeNode = findChildWithRdfaAttribute(
      element,
      'typeof',
      LOCN('Location'),
    );
    const placeResource = placeNode?.getAttribute('resource');
    const label =
      placeNode &&
      findChildWithRdfaAttribute(placeNode, 'property', RDFS('label'))
        ?.textContent;

    const pointNode =
      placeNode &&
      findChildWithRdfaAttribute(placeNode, 'property', LOCN('geometry'));
    const location = nodeContentsUtils.point.parse(pointNode);

    if (label && location) {
      return new Place({
        uri: placeResource ?? nodeContentsUtils.fallbackPlaceUri(),
        name: label,
        location,
      });
    } else {
      return;
    }
  };
