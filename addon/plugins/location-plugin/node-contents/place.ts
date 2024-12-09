import { PNode } from '@lblod/ember-rdfa-editor';
import { IncomingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  LOCN,
  PROV,
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

export const constructPlaceSpec = (place: Place, node: PNode) => {
  const linkingSpans = ((node.attrs.backlinks as IncomingTriple[]) ?? []).map(
    (bl) =>
      span({
        rev: bl.predicate,
        resource: bl.subject.value,
      }),
  );
  return span(
    {
      resource: place.uri,
      typeof: LOCN('Location').full,
      property: PROV('atLocation').full,
    },
    ...linkingSpans,
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
