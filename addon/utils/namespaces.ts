export type Resource = {
  prefixed: string;
  full: string;
};

export function namespace(uri: string, prefix: string) {
  return (s: string): Resource => {
    return {
      prefixed: prefix && `${prefix}:${s}`,
      full: uri + s,
    };
  };
}

export function hasRDFaAttribute(
  element: Element,
  attr: string,
  value: Resource
) {
  const result = element.getAttribute(attr)?.split(' ');
  if (result) {
    return result.includes(value.full) || result.includes(value.prefixed);
  }
  return false;
}

export const SAY = namespace('https://say.data.gift/ns/', 'say');
export const RDF = namespace(
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdf'
);

export const ELI = namespace('http://data.europa.eu/eli/ontology#', 'eli');
export const XSD = namespace('http://www.w3.org/2001/XMLSchema#', 'xsd');
export const EXT = namespace('http://mu.semte.ch/vocabularies/ext/', 'ext');
export const DCT = namespace('http://purl.org/dc/terms/', 'dct');
