import { Address, AddressSuggestion } from './types';

const LOC_GEOPUNT_ENDPOINT = `https://geo.api.vlaanderen.be/geolocation/v4/Location`;
const BASISREGISTER_ADRESMATCH = `https://basisregisters.vlaanderen.be/api/v1/adressen`;

export const replaceAccents = (string: string) =>
  string.normalize('NFD').replace(/([\u0300-\u036f])/g, '');

export async function getSuggestedLocations(query: string) {
  const result = await fetch(
    `${LOC_GEOPUNT_ENDPOINT}?q=${encodeURIComponent(
      query.replace(/^"(.*)"$/, '$1'),
    )}&c=10&type=Housenumber`,
    {
      method: 'GET',
    },
  );

  const jsonResult = (await result.json()) as {
    LocationResult: AddressSuggestion[];
  };

  if (!jsonResult) {
    return [];
  }

  return jsonResult.LocationResult;
}

export async function getAddressMatch({
  municipality,
  zipcode,
  street,
  housenumber,
}: {
  municipality: string;
  street: string;
  housenumber: string;
  zipcode: string;
}) {
  const url = new URL(BASISREGISTER_ADRESMATCH);

  url.searchParams.append('GemeenteNaam', replaceAccents(municipality));
  url.searchParams.append('Straatnaam', replaceAccents(street));
  url.searchParams.append('Huisnummer', replaceAccents(housenumber));
  url.searchParams.append('Postcode', replaceAccents(zipcode));

  const response = await fetch(url.toString(), {
    method: 'GET',
  });

  const result = (await response.json()) as {
    adressen: Address[];
  };

  if (!result) return [];

  return result.adressen;
}
