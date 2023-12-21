import { PNode } from '@lblod/ember-rdfa-editor';
import { Property } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import type { RdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';

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

  matches(fullOrPrefixed: string) {
    return this.full === fullOrPrefixed || this.prefixed === fullOrPrefixed;
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

export function hasParsedRDFaAttribute(
  rdfaAttrs: RdfaAttrs | false,
  predicate: Resource,
  object: Resource | string,
) {
  if (!rdfaAttrs || rdfaAttrs.rdfaNodeType !== 'resource') {
    return false;
  }
  return rdfaAttrs.properties.some((prop) => {
    return (
      prop.type === 'attribute' &&
      predicate.matches(prop.predicate) &&
      (typeof object === 'string'
        ? prop.object === object
        : object.matches(prop.object))
    );
  });
}
export function getParsedRDFAAttribute(
  rdfaAttrs: RdfaAttrs | false,
  predicate: Resource,
): Property | null {
  if (!rdfaAttrs) {
    return null;
  }
  return rdfaAttrs.properties.find((prop) => predicate.matches(prop.predicate));
}

export function hasBacklink(rdfaAttrs: RdfaAttrs | false, predicate: Resource) {
  return (
    rdfaAttrs &&
    rdfaAttrs.backlinks.some((bl) => predicate.matches(bl.predicate))
  );
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
