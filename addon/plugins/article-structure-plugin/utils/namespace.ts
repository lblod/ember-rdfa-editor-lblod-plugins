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
