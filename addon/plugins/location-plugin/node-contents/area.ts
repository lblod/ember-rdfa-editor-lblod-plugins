import {
  LOCN,
  RDFS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findChildWithRdfaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import {
  Area,
  Polygon,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { constructGeometrySpec } from './point';
import { type NodeContentsUtils } from './';
import { NamedNode } from '@rdfjs/types';

type ConstructAreaSpecOptions = {
  additionalRDFTypes?: NamedNode[];
};

export const constructAreaSpec = (
  area: Area,
  { additionalRDFTypes = [] }: ConstructAreaSpecOptions = {},
) => {
  return span(
    {
      resource: area.uri,
      typeof: [
        LOCN('Location').full,
        ...additionalRDFTypes.map((type) => type.value),
      ].join(' '),
    },
    span(
      {
        property: RDFS('label').full,
      },
      area.name,
    ),
    constructGeometrySpec(area.shape, LOCN('geometry')),
  );
};

export const parseAreaElement =
  (nodeContentsUtils: NodeContentsUtils) =>
  (placeNode: Element): Area | undefined => {
    const placeResource = placeNode?.getAttribute('resource');
    const label =
      placeNode &&
      findChildWithRdfaAttribute(placeNode, 'property', RDFS('label'))
        ?.textContent;

    const pointNode =
      placeNode &&
      findChildWithRdfaAttribute(placeNode, 'property', LOCN('geometry'));
    const shape = nodeContentsUtils.geometry.parse(pointNode);

    if (label && shape instanceof Polygon) {
      return new Area({
        uri: placeResource ?? nodeContentsUtils.fallbackPlaceUri(),
        name: label,
        shape,
      });
    } else {
      return;
    }
  };
