export class Resource {
  full: string;
  prefixed: string;

  constructor(full: string, prefixed: string) {
    this.full = full;
    this.prefixed = prefixed;
  }

  toString() {
    return this.full;
  }
}

export function namespace(uri: string, prefix: string) {
  return (s: string): Resource => {
    return new Resource(uri + s, `${prefix}:${s}`);
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
