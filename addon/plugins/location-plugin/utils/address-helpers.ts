import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { NodeContentsUtils } from '../node-contents';
import {
  convertLambertCoordsToWGS84,
  parseLambert72GMLString,
  Point,
} from './geo-helpers';

type Identificator = {
  id: string;
  naamruimte: string;
  objectId: string;
  versieId: string;
};
type GeographicalName = {
  spelling: string;
  taal: string;
};
type DetailLink = {
  objectId: string;
  detail: string;
};
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
        gemeentenaam: { geografischeNaam: GeographicalName };
      };
      straatnaam?: {
        straatnaam: {
          geografischeNaam: GeographicalName;
        };
      };
    },
  ];
};

type AddressSearchResult = {
  adressen: {
    identificator: Identificator;
    detail: string;
    huisnummer?: string;
    volledigAdres: GeographicalName;
    adresStatus: string;
  }[];
};

/**
 * {@link https://docs.basisregisters.vlaanderen.be/docs/api-documentation.html#operation/GetAddressV2}
 */
type AddressDetailResult = {
  identificator: Identificator;
  gemeente: DetailLink & {
    gemeentenaam: {
      geografischeNaam: GeographicalName;
    };
  };
  postinfo: DetailLink;
  straatnaam: DetailLink & {
    straatnaam: {
      geografischeNaam: GeographicalName;
    };
  };
  huisnummer: string;
  busnummer?: string;
  volledigAdres: GeographicalName;
  officieelToegekend: boolean;
  adresPositie: {
    geometrie: {
      type: 'Point' | string;
      /** GML encoded coordinates using Lambert72 CRS */
      gml: string;
    };
    positieGeometrieMethode: string;
    positieSpecificatie: string;
  };
};

export class Address {
  declare uri: string;
  declare belgianAddressUri?: string;
  declare street: string;
  declare zipcode: string;
  declare municipality: string;
  declare housenumber?: string;
  declare busnumber?: string;
  declare location: Point;
  declare truncated: boolean;

  constructor(
    args: Pick<
      Address,
      | 'street'
      | 'housenumber'
      | 'zipcode'
      | 'municipality'
      | 'uri'
      | 'busnumber'
      | 'location'
      | 'belgianAddressUri'
      | 'truncated'
    >,
  ) {
    Object.assign(this, args);
  }

  get formatted() {
    if (this.truncated) {
      if (this.housenumber && this.busnumber) {
        return `${this.street} ${this.housenumber} bus ${this.busnumber}`;
      } else if (this.housenumber) {
        return `${this.street} ${this.housenumber}`;
      } else {
        return `${this.street}`;
      }
    } else {
      if (this.housenumber && this.busnumber) {
        return `${this.street} ${this.housenumber} bus ${this.busnumber}, ${this.zipcode} ${this.municipality}`;
      } else if (this.housenumber) {
        return `${this.street} ${this.housenumber}, ${this.zipcode} ${this.municipality}`;
      } else {
        return `${this.street}, ${this.zipcode} ${this.municipality}`;
      }
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
  coords?: string;
  alternativeAddress?: Address;
  constructor({
    message,
    translation,
    status,
    coords,
    alternativeAddress,
  }: Pick<
    AddressError,
    'message' | 'translation' | 'status' | 'alternativeAddress' | 'coords'
  >) {
    super(message);
    this.translation = translation;
    this.status = status;
    this.coords = coords;
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

export async function resolveStreet(
  info: StreetInfo,
  nodeContentsUtils: NodeContentsUtils,
) {
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
        uri: nodeContentsUtils.fallbackAddressUri(),
        belgianAddressUri: `https://data.vlaanderen.be/id/straatnaam/${streetinfo.ID}`,
        street: unwrap(streetinfo.Thoroughfarename),
        municipality: streetinfo.Municipality,
        zipcode: unwrap(streetinfo.Zipcode),
        truncated: false,
        location: new Point({
          uri: nodeContentsUtils.fallbackGeometryUri(),
          location: {
            global: {
              lng: streetinfo.Location.Lon_WGS84,
              lat: streetinfo.Location.Lat_WGS84,
            },
            lambert: {
              x: streetinfo.Location.X_Lambert72,
              y: streetinfo.Location.Y_Lambert72,
            },
          },
        }),
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

export async function resolveAddress(
  info: AddressInfo,
  nodeContentsUtils: NodeContentsUtils,
) {
  const addressSearchResult = await searchAddress(info, 1);
  if (addressSearchResult.adressen.length) {
    const addressDetailURL = addressSearchResult.adressen[0].detail;
    const response = await fetch(addressDetailURL);
    if (response.ok) {
      const result = (await response.json()) as AddressDetailResult;
      const { lambert } = parseLambert72GMLString(
        result.adresPositie.geometrie.gml,
      );
      return new Address({
        street: result.straatnaam.straatnaam.geografischeNaam.spelling,
        housenumber: result.huisnummer,
        busnumber: result.busnummer,
        zipcode: result.postinfo.objectId,
        municipality: result.gemeente.gemeentenaam.geografischeNaam.spelling,
        uri: nodeContentsUtils.fallbackAddressUri(),
        belgianAddressUri: result.identificator.id,
        truncated: false,
        location: new Point({
          uri: `${result.identificator.id}/1`,
          location: {
            lambert,
            global: convertLambertCoordsToWGS84(lambert),
          },
        }),
      });
    } else {
      throw new AddressError({
        translation: 'editor-plugins.address.edit.errors.http-error',
        message: `An error occured when querying the address register, status code: ${response.status}`,
        status: response.status,
      });
    }
  } else {
    const alternativeAddress = await resolveStreet(
      {
        street: info.street,
        municipality: info.municipality,
      },
      nodeContentsUtils,
    );

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
