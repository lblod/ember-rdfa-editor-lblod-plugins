import { v4 as uuidv4 } from 'uuid';
import {
  GEOSPARQL,
  LOCN,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  findChildWithRdfaAttribute,
  type Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import {
  constructLambert72WKTString,
  parseLambert72GMLString,
  parseLambert72WKTString,
  Point,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';

export const fallbackPointUri = () =>
  `http://data.lblod.info/id/geometrie/${uuidv4()}`;

export const constructPointNode = (point: Point, property: Resource) => {
  return span(
    {
      property: property.full,
      resource: point.uri,
      typeof: LOCN('Geometry').full,
    },
    span({
      property: GEOSPARQL('asWKT').full,
      datatype: GEOSPARQL('wktLiteral').full,
      content: constructLambert72WKTString(point.location.lambert),
    }),
  );
};

export const parsePointNode = (
  node: Element | undefined,
): Point | undefined => {
  const wkt =
    node &&
    findChildWithRdfaAttribute(
      node,
      'property',
      GEOSPARQL('asWKT'),
    )?.getAttribute('content');
  const uri = node?.getAttribute('resource');

  const location =
    typeof wkt === 'string' ? parseLambert72WKTString(wkt) : undefined;

  return (
    location &&
    new Point({
      uri: uri ?? fallbackPointUri(),
      location,
    })
  );
};

export const parseOldPointNode = (
  node: Element | undefined,
): Point | undefined => {
  const gml =
    node &&
    findChildWithRdfaAttribute(
      node,
      'property',
      GEOSPARQL('asGML'),
    )?.getAttribute('content');

  const location =
    typeof gml === 'string' ? parseLambert72GMLString(gml) : undefined;

  return location && new Point({ uri: fallbackPointUri(), location });
};
