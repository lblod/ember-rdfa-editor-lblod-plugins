import { PNode } from '@lblod/ember-rdfa-editor';

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

  equals(resource: Resource | string) {
    if (resource instanceof Resource) {
      return this.full === resource.full;
    } else {
      return this.full === resource || this.prefixed === resource;
    }
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
  value: Resource,
) {
  const result = element.getAttribute(attr)?.split(' ');
  if (result) {
    return result.includes(value.full) || result.includes(value.prefixed);
  }
  return false;
}

export function findChildWithRdfaAttribute(
  element: Element,
  attr: string,
  value: Resource,
) {
  return [...element.children].find((child) => {
    const result = child.getAttribute(attr)?.split(' ');
    return result?.includes(value.full) || result?.includes(value.prefixed);
  });
}

export function pnodeHasRdfaAttribute(
  node: PNode,
  attr: string,
  value: Resource,
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
  stringToExpand: string,
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
