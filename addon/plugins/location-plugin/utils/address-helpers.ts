import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

type GeoCoordinate = {
  Lat_WGS84: number;
  Lon_WGS84: number;
  X_Lambert72: number;
  Y_Lambert72: number;
};
/**
 * Specified [in the API docs]{@link https://geo.api.vlaanderen.be/geolocation/}.
 * It is not specified which fields can be null, so these might be incorrect.
 */
type LocationRegisterSearchResult = {
  LocationResult: [
    {
      ID: number;
      Municipality: string;
      Zipcode: string | null;
      Thoroughfarename: string | null;
      Housenumber: string | null;
      FormattedAddress: string | null;
      Location: GeoCoordinate;
      LocationType: string | null;
      BoundingBox: {
        LowerLeft: GeoCoordinate;
        UpperRight: GeoCoordinate;
      };
    },
  ];
};

type StreetSearchResult = {
  adresMatches: [
    {
      gemeente: {
        gemeentenaam: { geografischeNaam: { spelling: string } };
      };
      straatnaam?: {
        straatnaam: {
          geografischeNaam: { spelling: string };
        };
      };
    },
  ];
};

type AddressSearchResult = {
  adressen: {
    identificator: {
      id: string;
    };
    detail: string;
  }[];
};

/**
 * {@link https://docs.basisregisters.vlaanderen.be/docs/api-documentation.html#operation/GetAddressV2}
 */
type AddressDetailResult = {
  identificator: {
    id: string;
  };
  gemeente: {
    gemeentenaam: {
      geografischeNaam: {
        spelling: string;
        taal: string;
      };
    };
  };
  postinfo: {
    objectId: string;
  };
  straatnaam: {
    straatnaam: {
      geografischeNaam: {
        spelling: string;
        taal: string;
      };
    };
  };
  huisnummer: string;
  busnummer: string;
  adresPositie: {
    geometrie: {
      gml: string; // coordinates in Lambert72
    };
  };
};

export class Address {
  declare id?: string;
  declare street: string;
  declare zipcode: string;
  declare municipality: string;
  declare housenumber?: string;
  declare busnumber?: string;
  declare location: Lambert72Coordinates;
  constructor(
    args: Pick<
      Address,
      | 'street'
      | 'housenumber'
      | 'zipcode'
      | 'municipality'
      | 'id'
      | 'busnumber'
      | 'location'
    >,
  ) {
    Object.assign(this, args);
  }

  get formatted() {
    if (this.housenumber && this.busnumber) {
      return `${this.street} ${this.housenumber} bus ${this.busnumber}, ${this.zipcode} ${this.municipality}`;
    } else if (this.housenumber) {
      return `${this.street} ${this.housenumber}, ${this.zipcode} ${this.municipality}`;
    } else {
      return `${this.street}, ${this.zipcode} ${this.municipality}`;
    }
  }

  sameAs(
    other?: Pick<
      Address,
      'street' | 'housenumber' | 'busnumber' | 'municipality'
    > | null,
  ) {
    return (
      this.street === other?.street &&
      this.housenumber === other?.housenumber &&
      this.busnumber === other?.busnumber &&
      this.municipality === other?.municipality
    );
  }

  get hasHouseNumber() {
    return !!this.housenumber;
  }
}

export class AddressError extends Error {
  translation: string;
  status?: number;
  alternativeAddress?: Address;
  constructor({
    message,
    translation,
    status,
    alternativeAddress,
  }: Pick<
    AddressError,
    'message' | 'translation' | 'status' | 'alternativeAddress'
  >) {
    super(message);
    this.translation = translation;
    this.status = status;
    this.alternativeAddress = alternativeAddress;
  }
}

const LOC_GEOPUNT_ENDPOINT = `https://geo.api.vlaanderen.be/geolocation/v4/Location`;
const BASISREGISTER = 'https://api.basisregisters.vlaanderen.be/v2';
const BASISREGISTER_ADRESMATCH = `${BASISREGISTER}/adresmatch`;
const BASISREGISTER_ADRES = `${BASISREGISTER}/adressen`;

export const replaceAccents = (string: string) =>
  string.normalize('NFD').replace(/([\u0300-\u036f])/g, '');

export async function fetchMunicipalities(term: string): Promise<string[]> {
  const url = new URL(LOC_GEOPUNT_ENDPOINT);
  url.searchParams.append('q', replaceAccents(term.replace(/^"(.*)"$/, '$1')));
  url.searchParams.append('c', '10');
  url.searchParams.append('type', 'Municipality');
  const result = await fetch(url, {
    method: 'GET',
  });
  if (result.ok) {
    const jsonResult = (await result.json()) as LocationRegisterSearchResult;
    const municipalities = jsonResult.LocationResult.map(
      (entry) => entry.Municipality,
    );
    return municipalities;
  } else {
    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.http-error',
      message: `An error occured when querying the location register, status code: ${result.status}`,
      status: result.status,
    });
  }
}

export async function fetchStreets(term: string, municipality: string) {
  const url = new URL(BASISREGISTER_ADRESMATCH);
  url.searchParams.append(
    'straatnaam',
    replaceAccents(term.replace(/^"(.*)"$/, '$1')),
  );
  url.searchParams.append('gemeentenaam', municipality);
  const result = await fetch(url, {
    method: 'GET',
  });
  if (result.ok) {
    const jsonResult = (await result.json()) as StreetSearchResult;

    const streetnames = jsonResult.adresMatches
      .map((entry) => entry.straatnaam?.straatnaam.geografischeNaam.spelling)
      .filter(Boolean);

    return streetnames;
  } else {
    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.http-error',
      message: `An error occured when querying the address register, status code: ${result.status}`,
      status: result.status,
    });
  }
}

type StreetInfo = {
  municipality: string;
  street: string;
};

export async function resolveStreet(info: StreetInfo) {
  const searchTerm = `${info.street}, ${info.municipality}`;
  const url = new URL(LOC_GEOPUNT_ENDPOINT);
  url.searchParams.append(
    'q',
    replaceAccents(searchTerm.replace(/^"(.*)"$/, '$1')),
  );
  url.searchParams.append('c', '1');
  url.searchParams.append('type', 'ThoroughFarename');
  const result = await fetch(url, {
    method: 'GET',
  });
  if (result.ok) {
    const jsonResult = (await result.json()) as LocationRegisterSearchResult;
    const streetinfo = jsonResult.LocationResult[0];
    if (streetinfo) {
      return new Address({
        street: unwrap(streetinfo.Thoroughfarename),
        municipality: streetinfo.Municipality,
        zipcode: unwrap(streetinfo.Zipcode),
        location: {
          x: streetinfo.Location.X_Lambert72,
          y: streetinfo.Location.Y_Lambert72,
        },
      });
    } else {
      throw new AddressError({
        translation: 'editor-plugins.address.edit.errors.address-not-found',
        message: `Could not find address in address register`,
      });
    }
  } else {
    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.http-error',
      message: `An error occured when querying the location register, status code: ${result.status}`,
      status: result.status,
    });
  }
}
type AddressInfo = {
  municipality: string;
  street: string;
  housenumber: string;
  busnumber?: string;
};

export async function resolveAddress(info: AddressInfo) {
  const addressSearchResult = await searchAddress(info, 1);
  if (addressSearchResult.adressen.length) {
    const addressDetailURL = addressSearchResult.adressen[0].detail;
    const response = await fetch(addressDetailURL);
    if (response.ok) {
      const result = (await response.json()) as AddressDetailResult;
      return new Address({
        street: result.straatnaam.straatnaam.geografischeNaam.spelling,
        housenumber: result.huisnummer,
        busnumber: result.busnummer,
        zipcode: result.postinfo.objectId,
        municipality: result.gemeente.gemeentenaam.geografischeNaam.spelling,
        id: result.identificator.id,
        location: parseLambert72GMLString(result.adresPositie.geometrie.gml),
      });
    } else {
      throw new AddressError({
        translation: 'editor-plugins.address.edit.errors.http-error',
        message: `An error occured when querying the address register, status code: ${response.status}`,
        status: response.status,
      });
    }
  } else {
    const alternativeAddress = await resolveStreet({
      street: info.street,
      municipality: info.municipality,
    });

    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.address-not-found',
      message: `Could not find address in address register`,
      alternativeAddress,
    });
  }
}

export async function searchAddress(
  { municipality, street, housenumber, busnumber }: AddressInfo,
  limit = 10,
) {
  const url = new URL(BASISREGISTER_ADRES);

  url.searchParams.append('GemeenteNaam', replaceAccents(municipality));
  url.searchParams.append('Straatnaam', replaceAccents(street));
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('Huisnummer', replaceAccents(housenumber));
  if (busnumber) {
    url.searchParams.append('Busnummer', replaceAccents(busnumber));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
  });

  if (response.ok) {
    return (await response.json()) as AddressSearchResult;
  } else {
    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.http-error',
      message: `An error occured when querying the address register, status code: ${response.status}`,
      status: response.status,
    });
  }
}

/** Representation of a location in the `BD72 / Belgian Lambert 72` Coordinate Reference System */
export type Lambert72Coordinates = {
  x: number;
  y: number;
};

export function constructLambert72GMLString({ x, y }: Lambert72Coordinates) {
  return `<gml:Point srsName="https://www.opengis.net/def/crs/EPSG/0/31370" xmlns:gml="http://www.opengis.net/gml/3.2"><gml:pos>${x} ${y}</gml:pos></gml:Point>`;
}
/**
 * Use a regex to parse a simple point as a GML string and return the coordinates.
 * Throws an error if the format or CRS are not recognised
 */
export function parseLambert72GMLString(gml: string): Lambert72Coordinates {
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
  return { x: Number(x), y: Number(y) };
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
export function parseLambert72WKTString(gml: string): Lambert72Coordinates {
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
  return { x: Number(x), y: Number(y) };
}
