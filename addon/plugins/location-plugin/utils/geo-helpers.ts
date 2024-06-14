import memoize from '@lblod/ember-rdfa-editor-lblod-plugins/utils/memoize';
import { AddressError } from './address-helpers';

/** A point represents a location in the OSLO model. */
export class Point {
  declare uri: string;
  declare location: GeoPos;
  constructor(args: Omit<Point, 'constructor' | 'formatted'>) {
    Object.assign(this, args);
  }

  get formatted() {
    return `[${this.location.lambert.x}, ${this.location.lambert.y}]`;
  }
}
/**
 * A place represents the combination of a location and a name in the OSLO model. Only the name is
 * displayed in the human readable text.
 */
export class Place {
  declare uri: string;
  declare name: string;
  declare location: Point;
  constructor(args: Omit<Place, 'constructor' | 'formatted'>) {
    Object.assign(this, args);
  }

  get formatted() {
    return this.name;
  }
}

/**
 * Use the epsg.io API to convert between CRSs. We could use a library such as proj4js to convert
 * locally, but the results do not agree with those given by this API or the proj (C++) library.
 * This is likely a problem with the WKT2 representation of the Lambert72 projection on epsg.io, but
 * while that is investigated, just use the API...
 */
export const convertLambertCoordsToWGS84 = memoize(
  async (lambert: Lambert72Coordinates): Promise<GlobalCoordinates> => {
    const res = await fetch(
      `https://epsg.io/trans?x=${lambert.x}&y=${lambert.y}&z=0&s_srs=31370&t_srs=4326`,
    );
    if (!res.ok) {
      throw new AddressError({
        translation: 'editor-plugins.address.edit.errors.projection-error',
        message: `Unable to convert location coordinates: ${JSON.stringify(lambert)}`,
        coords: JSON.stringify(lambert),
      });
    }
    const { x: lng, y: lat } = await res.json();
    return { lat: Number(lat), lng: Number(lng) };
  },
);
/**
 * Use the epsg.io API to convert between CRSs. We could use a library such as proj4js to convert
 * locally, but the results do not agree with those given by this API or the proj (C++) library.
 * This is likely a problem with the WKT2 representation of the Lambert72 projection on epsg.io, but
 * while that is investigated, just use the API...
 */
export const convertWGS84CoordsToLambert = memoize(
  async (wgs84: GlobalCoordinates): Promise<Lambert72Coordinates> => {
    const res = await fetch(
      `https://epsg.io/trans?x=${wgs84.lng}&y=${wgs84.lat}&z=0&s_srs=4326&t_srs=31370`,
    );
    if (!res.ok) {
      throw new Error('Unable to convert');
    }
    const { x: lng, y: lat } = await res.json();
    return { y: Number(lat), x: Number(lng) };
  },
);

/** Representation of a location in the `WGS84` (globally applicable) Coordinate Reference System */
export type GlobalCoordinates = {
  lat: number;
  lng: number;
};
/** Representation of a location in the `BD72 / Belgian Lambert 72` Coordinate Reference System */
export type Lambert72Coordinates = {
  x: number;
  y: number;
};

/**
 * Geographical position in both reference systems used in this plugin.
 * Most mapping software assumes coordinates use the WGS84 CRS. The OSLO RDFa model as well as some
 * of the APIs we use, use the Belgium-specific Lambert 72 CRS. To avoid the difficulties in
 * supporting map positions and tiles following this CRS, we convert instead to WGS84, or use it
 * directly when returned from an API.
 */
export type GeoPos = {
  global?: GlobalCoordinates;
  lambert: Lambert72Coordinates;
};

export function constructLambert72GMLString({ x, y }: Lambert72Coordinates) {
  return `<gml:Point srsName="https://www.opengis.net/def/crs/EPSG/0/31370" xmlns:gml="http://www.opengis.net/gml/3.2"><gml:pos>${x} ${y}</gml:pos></gml:Point>`;
}
/**
 * Use a regex to parse a simple point as a GML string and return the coordinates.
 * Throws an error if the format or CRS are not recognised
 */
export function parseLambert72GMLString(gml: string): GeoPos {
  // Parsers for GML exist in other libraries, but mostly within much larger projects (e.g.
  // openlayers) in a way that is hard to extract due to the potential complexity of the geometries
  // which can be represented. Since we handle only simple points, it's much less complex to just
  // use a simple regex.
  const [_, crs, x, y] =
    /<gml.Point .*srsName="https:\/\/www.opengis.net\/def\/crs\/([^"]+)".+<gml.pos>(\S+) ([^<]+)<\/gml:pos>/.exec(
      gml,
    ) || [];
  if (!crs || crs !== 'EPSG/0/31370') {
    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.http-error',
      message: 'An error occured when querying the address register',
    });
  }
  const lambert = { x: Number(x), y: Number(y) };

  return { lambert };
}
/**
 * Construct a string to represent a geolocation, using the Lambert 72 reference system according to
 * [the GeoSPARQL spec]{@link https://docs.ogc.org/is/22-047r1/22-047r1.html#10-8-1-%C2%A0-well-known-text}
 */
export function constructLambert72WKTString({ x, y }: Lambert72Coordinates) {
  return `<https://www.opengis.net/def/crs/EPSG/0/31370> POINT(${x} ${y})`;
}
/**
 * Use a regex to parse a simple point as a WKT string and return the coordinates.
 * Throws an error if the format or CRS are not recognised
 */
export function parseLambert72WKTString(gml: string): GeoPos {
  // Parsers for WKT exist in other libraries, but either within much larger projects (e.g.
  // openlayers) in a way that is hard to extract due to the potential complexity of the geometries
  // which can be represented or within untyped libraries (e.g. wicket). Since we handle only simple
  // points, it's much less complex to just use a simple regex.
  const [_, crs, x, y] =
    /<https:\/\/www.opengis.net\/def\/crs\/([^"]+)> POINT\((\S+) ([^)]+)\)/.exec(
      gml,
    ) || [];
  if (!crs || crs !== 'EPSG/0/31370') {
    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.http-error',
      message: 'An error occured when querying the address register',
    });
  }
  const lambert = { x: Number(x), y: Number(y) };

  return { lambert };
}
