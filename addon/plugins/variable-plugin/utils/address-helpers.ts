import { Address, ResolvedAddress } from '../variables/address';

type LocationRegisterResult = {
  LocationResult: {
    ID: number;
    FormattedAddress: string;
    Municipality: string;
    Thoroughfarename: string; // street
    Housenumber?: string | null;
    Zipcode: string;
    Location: {
      Lat_WGS84: number;
      Lon_WGS84: number;
      X_Lambert72: number;
      Y_Lambert72: number;
    };
  }[];
};

type AddressRegisterResult = {
  adressen: {
    identificator: {
      id: string;
      naamruimte: string;
      objectId: string;
      versieId: string;
    };
    detail: string;
    huisnummer: string;
    volledigAdres: {
      geografischeNaam: {
        spelling: string;
        taal: string;
      };
    };
    adresStatus: string;
  }[];
};

const LOC_GEOPUNT_ENDPOINT = `https://geo.api.vlaanderen.be/geolocation/v4/Location`;
const BASISREGISTER_ADRESMATCH = `https://basisregisters.vlaanderen.be/api/v1/adressen`;

export const replaceAccents = (string: string) =>
  string.normalize('NFD').replace(/([\u0300-\u036f])/g, '');

export async function fetchAddresses(
  query: string,
  includeHousenumber = true,
): Promise<Address[]> {
  const url = new URL(LOC_GEOPUNT_ENDPOINT);
  url.searchParams.append('q', replaceAccents(query.replace(/^"(.*)"$/, '$1')));
  url.searchParams.append('c', '10');
  url.searchParams.append(
    'type',
    includeHousenumber ? 'Housenumber' : 'Thoroughfarename',
  );
  const result = await fetch(url, {
    method: 'GET',
  });

  if (result.ok) {
    const jsonResult = (await result.json()) as LocationRegisterResult;
    const addresses = jsonResult.LocationResult.map(
      (entry) =>
        new Address({
          street: entry.Thoroughfarename,
          housenumber: entry.Housenumber,
          zipcode: entry.Zipcode,
          municipality: entry.Municipality,
          location: {
            lat_WGS84: entry.Location.Lat_WGS84,
            long_WGS84: entry.Location.Lon_WGS84,
          },
        }),
    );
    return addresses;
  } else {
    throw new Error(
      'An error occured when querying the location register, status code: ${response.status}',
    );
  }
}

export async function resolveAddress(
  address: Address,
): Promise<ResolvedAddress> {
  const url = new URL(BASISREGISTER_ADRESMATCH);

  url.searchParams.append('GemeenteNaam', replaceAccents(address.municipality));
  url.searchParams.append('Straatnaam', replaceAccents(address.street));
  if (address.housenumber) {
    url.searchParams.append('Huisnummer', replaceAccents(address.housenumber));
  }
  url.searchParams.append('Postcode', replaceAccents(address.zipcode));

  const response = await fetch(url.toString(), {
    method: 'GET',
  });
  if (response.ok) {
    const result = (await response.json()) as AddressRegisterResult;
    if (result.adressen.length) {
      const addressRegisterId = result.adressen[0].identificator.id;
      return ResolvedAddress.resolve(address, addressRegisterId);
    } else {
      throw new Error('Could not find address in address register');
    }
  } else {
    throw new Error(
      `An error occured when querying the address register, status code: ${response.status}`,
    );
  }
}
