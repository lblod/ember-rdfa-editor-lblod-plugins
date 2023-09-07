import { capitalize } from '@ember/string';

export const LEGISLATION_TYPES = {
  decreet: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Decreet',
  'koninklijk besluit':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/KoninklijkBesluit',
  wet: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Wet',
  'ministerieel besluit':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/MinisterieelBesluit',
  'besluit van de vlaamse regering':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/BesluitVanDeVlaamseRegering',
  omzendbrief:
    'https://data.vlaanderen.be/id/concept/AardWetgeving/Omzendbrief',
  verdrag: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Verdrag',
  grondwet: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Grondwet',
  grondwetswijziging:
    'https://data.vlaanderen.be/id/concept/AardWetgeving/Grondwetwijziging',
  samenwerkingsakkoord:
    'https://data.vlaanderen.be/id/concept/AardWetgeving/Samenwerkingsakkoord',
  wetboek: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Wetboek',
  // do not change this url without doublechecking, yes they actually did encode the ö in the url
  'gecoördineerde wetten':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/Geco%C3%B6rdineerde+Wet',
  'bijzondere wet':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/BijzondereWet',
  'genummerd koninklijk besluit':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/GenummerdKoninklijkBesluit',
  protocol: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Protocol',
  besluit: 'https://data.vlaanderen.be/doc/concept/AardWetgeving/Besluit',
};

export const legislationKeysCapitalized = Object.keys(LEGISLATION_TYPES).map(
  capitalize,
) as [Capitalize<keyof typeof LEGISLATION_TYPES>];

export const isLegislationType = (
  type: string,
): type is keyof typeof LEGISLATION_TYPES =>
  Object.keys(LEGISLATION_TYPES).includes(type);

export const isBesluitType = (type: string) =>
  type === LEGISLATION_TYPES['besluit'];

export const LEGISLATION_TYPE_CONCEPTS = Object.entries(LEGISLATION_TYPES).map(
  ([label, value]) => ({
    label,
    value,
  }),
);

export interface Binding<A> {
  value: A;
}
