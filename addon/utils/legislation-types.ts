const LEGISLATION_TYPES = {
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
  'gecoördineerde wetten':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/GecoordineerdeWetten',
  'bijzondere wet':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/BijzondereWet',
  'genummerd koninklijk besluit':
    'https://data.vlaanderen.be/id/concept/AardWetgeving/GenummerdKoninklijkBesluit',
  protocol: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Protocol',
};

export type Legislations = typeof LEGISLATION_TYPES;
export type LegislationKey = keyof Legislations;
// export type MappedLegislations = {
//   [K in LegislationKey]: {
//     label: K;
//     value: Legislations[K];
//   };
// };
// export type MappedLegislation = MappedLegislations[LegislationKey];
const LEGISLATION_TYPE_CONCEPTS = Object.entries(LEGISLATION_TYPES).map(
  (pair: [string, string]) => {
    return {
      label: pair[0],
      value: pair[1],
    };
  }
);

export { LEGISLATION_TYPES, LEGISLATION_TYPE_CONCEPTS };
