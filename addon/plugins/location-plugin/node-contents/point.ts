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
  Polygon,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/geo-helpers';
import { type NodeContentsUtils } from './';

export const constructGeometrySpec = (
  geometry: Point | Polygon,
  property: Resource,
) =>
  span(
    {
      property: property.full,
      resource: geometry.uri,
      typeof: LOCN('Geometry').full,
    },
    span({
      property: GEOSPARQL('asWKT').full,
      datatype: GEOSPARQL('wktLiteral').full,
      content: constructLambert72WKTString(
        'location' in geometry
          ? geometry.location.lambert
          : geometry.locations.map(({ lambert }) => lambert),
      ),
    }),
  );

export const parseGeometryElement =
  (nodeContentsUtils: NodeContentsUtils) =>
  (node: Element | undefined): Point | Polygon | undefined => {
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

    if (location) {
      if (!Array.isArray(location)) {
        return new Point({
          uri: uri ?? nodeContentsUtils.fallbackGeometryUri(),
          location,
        });
      } else {
        return new Polygon({
          uri: uri ?? nodeContentsUtils.fallbackGeometryUri(),
          locations: location,
        });
      }
    }
    return undefined;
  };

export const parseOldPointElement =
  (nodeContentsUtils: NodeContentsUtils) =>
  (node: Element | undefined): Point | undefined => {
    const gml =
      node &&
      findChildWithRdfaAttribute(
        node,
        'property',
        GEOSPARQL('asGML'),
      )?.getAttribute('content');

    const location =
      typeof gml === 'string' ? parseLambert72GMLString(gml) : undefined;

    return (
      location &&
      new Point({ uri: nodeContentsUtils.fallbackGeometryUri(), location })
    );
  };
