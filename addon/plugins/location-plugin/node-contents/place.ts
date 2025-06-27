import {
  LOCN,
  RDFS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findChildWithRdfaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import {
  Place,
  Point,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { constructGeometrySpec } from './point';
import { type NodeContentsUtils } from './';
import { NamedNode } from '@rdfjs/types';

type ConstructPlaceSpecOptions = {
  additionalRDFTypes?: NamedNode[];
};

export const constructPlaceSpec = (
  place: Place,
  { additionalRDFTypes = [] }: ConstructPlaceSpecOptions = {},
) => {
  return span(
    {
      resource: place.uri,
      typeof: [
        LOCN('Location').full,
        ...additionalRDFTypes.map((type) => type.value),
      ].join(' '),
    },
    span(
      {
        property: RDFS('label').full,
      },
      place.name,
    ),
    constructGeometrySpec(place.location, LOCN('geometry')),
  );
};

export const parsePlaceElement =
  (nodeContentsUtils: NodeContentsUtils) =>
  (placeNode: Element): Place | undefined => {
    const placeResource = placeNode?.getAttribute('resource');
    const label =
      placeNode &&
      findChildWithRdfaAttribute(placeNode, 'property', RDFS('label'))
        ?.textContent;

    const pointNode =
      placeNode &&
      findChildWithRdfaAttribute(placeNode, 'property', LOCN('geometry'));
    const location = nodeContentsUtils.geometry.parse(pointNode);

    if (label && location instanceof Point) {
      return new Place({
        uri: placeResource ?? nodeContentsUtils.fallbackPlaceUri(),
        name: label,
        location,
      });
    } else {
      return;
    }
  };
