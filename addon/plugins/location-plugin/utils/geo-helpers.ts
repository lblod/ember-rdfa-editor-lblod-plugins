import proj from 'proj4';
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
 * An area represents multiple points which bound a part of the map, along with the human readable
 * name of that it represents. This is used as a place for the oslo model.
 */
export class Area {
  declare uri: string;
  declare name: string;
  declare locations: GeoPos[];
  constructor(args: Omit<Area, 'constructor' | 'formatted'>) {
    Object.assign(this, args);
  }

  get formatted() {
    return this.name;
  }
}

/**
 * This CRS definition is corrected from that on epsg.io/31370, as there is a known bug that their
 * definitions invert some of the TOWGS84 parameters.
 * See [this issue]{@link https://github.com/OSGeo/PROJ/issues/4170} for more details.
 */
const LAMBERT_CRS =
  'PROJCS["BD72 / Belgian Lambert 72",GEOGCS["BD72",DATUM["Reseau_National_Belge_1972",SPHEROID["International 1924",6378388,297],TOWGS84[-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4313"]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["latitude_of_origin",90],PARAMETER["central_meridian",4.36748666666667],PARAMETER["standard_parallel_1",51.1666672333333],PARAMETER["standard_parallel_2",49.8333339],PARAMETER["false_easting",150000.013],PARAMETER["false_northing",5400088.438],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","31370"]]';
const lambertToWgs84 = proj(LAMBERT_CRS, 'EPSG:4326');
/**
 * Convert between CRSs using the proj4js library.
 */
export function convertLambertCoordsToWGS84(
  lambert: Lambert72Coordinates,
): GlobalCoordinates {
  const { x, y } = lambertToWgs84.forward(lambert);
  return { lat: y, lng: x };
}
/**
 * Convert between CRSs using the proj4js library.
 */
export function convertWGS84CoordsToLambert(
  wgs84: GlobalCoordinates,
): Lambert72Coordinates {
  return lambertToWgs84.inverse({ x: wgs84.lng, y: wgs84.lat });
}

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
