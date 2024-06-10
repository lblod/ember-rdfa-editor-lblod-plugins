import { v4 as uuidv4 } from 'uuid';
import {
  DCT,
  LOCN,
  RDFS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findChildWithRdfaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import { Place } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { constructPointNode, parsePointNode } from './point';

export const fallbackPlaceUri = () =>
  `http://data.lblod.info/id/plaats/${uuidv4()}`;

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
    constructPointNode(place.location, LOCN('geometry')),
  );
};

export const parsePlaceElement = (element: Element): Place | undefined => {
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
  const location = parsePointNode(pointNode);

  if (placeResource && label && location) {
    return new Place({
      uri: placeResource,
      name: label,
      location,
    });
  } else {
    return;
  }
};
