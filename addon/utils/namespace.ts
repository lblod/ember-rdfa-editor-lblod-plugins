import { PNode } from '@lblod/ember-rdfa-editor';

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

export function pnodeHasRdfaAttribute(
  node: PNode,
  attr: string,
  value: Resource
) {
  const result = (node.attrs[attr] as string | null)?.split(' ');
  if (result) {
    return result.includes(value.full) || result.includes(value.prefixed);
  }
  return false;
}

export function expandPrefixedString(
  base: string,
  prefix: string,
  stringToExpand: string
): string {
  if (stringToExpand.startsWith(base)) {
    return stringToExpand;
  } else if (stringToExpand.startsWith(prefix)) {
    const [, affix] = stringToExpand.split(':');
    return base + affix;
  } else {
    return stringToExpand;
  }
}
