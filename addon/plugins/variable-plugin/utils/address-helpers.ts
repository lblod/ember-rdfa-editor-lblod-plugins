import { Address } from '../variables/address';

type MunicipalitySearchResult = {
  LocationResult: {
    Municipality: string;
    Location: {
      Lat_WGS84: number;
      Lon_WGS84: number;
      X_Lambert72: number;
      Y_Lambert72: number;
    };
  }[];
};

type StreetSearchResult = {
  adresMatches: [
    {
      gemeente: {
        gemeentenaam: { geografischeNaam: { spelling: string } };
      };
      straatnaam: {
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
    point: {
      coordinates: [number, number]; // coordinates in Lambert72
    };
  };
};

export class AddressError extends Error {
  translation: string;
  status?: number;
  constructor({
    message,
    translation,
    status,
  }: Pick<AddressError, 'message' | 'translation' | 'status'>) {
    super(message);
    this.translation = translation;
    this.status = status;
  }
}

const LOC_GEOPUNT_ENDPOINT = `https://geo.api.vlaanderen.be/geolocation/v4/Location`;
const BASISREGISTER_ADRESMATCH =
  'https://api.basisregisters.vlaanderen.be/v2/adresmatch';
const BASISREGISTER_ADRES = `https://basisregisters.vlaanderen.be/api/v2/adressen`;

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
    const jsonResult = (await result.json()) as MunicipalitySearchResult;
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
    const streetnames = jsonResult.adresMatches.map((entry) => {
      return entry.straatnaam.straatnaam.geografischeNaam.spelling;
    });
    return streetnames;
  } else {
    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.http-error',
      message: `An error occured when querying the address register, status code: ${result.status}`,
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
      });
    } else {
      throw new AddressError({
        translation: 'editor-plugins.address.edit.errors.http-error',
        message: `An error occured when querying the address register, status code: ${response.status}`,
        status: response.status,
      });
    }
  } else {
    throw new AddressError({
      translation: 'editor-plugins.address.edit.errors.address-not-found',
      message: `Could not find address in address register`,
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
