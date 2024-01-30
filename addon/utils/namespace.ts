import { Attrs } from 'prosemirror-model';
import { AttributeProperty } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  isRdfaAttrs,
  RdfaAttrs,
  RdfaResourceAttrs,
} from '@lblod/ember-rdfa-editor/core/schema';
import { Option } from './option';

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
  rdfaAttrs: Attrs | false,
  predicate: Resource,
  object: Resource | string,
) {
  if (
    !rdfaAttrs ||
    !isRdfaAttrs(rdfaAttrs) ||
    rdfaAttrs.rdfaNodeType !== 'resource'
  ) {
    return false;
  }
  return (rdfaAttrs as RdfaResourceAttrs).properties.some((prop) => {
    return (
      prop.type === 'attribute' &&
      predicate.matches(prop.predicate) &&
      (typeof object === 'string'
        ? prop.object === object
        : object.matches(prop.object))
    );
  });
}

export function getParsedRDFAAttribute(rdfaAttrs: Attrs, predicate: Resource) {
  return (isRdfaAttrs(rdfaAttrs) &&
    rdfaAttrs.rdfaNodeType === 'resource' &&
    rdfaAttrs.properties.find(
      (prop) => prop.type === 'attribute' && predicate.matches(prop.predicate),
    )) as Option<AttributeProperty>;
}

export function getParsedRDFAAttributeList(
  rdfaAttrs: Attrs,
  predicate: Resource,
) {
  return ((isRdfaAttrs(rdfaAttrs) &&
    rdfaAttrs.rdfaNodeType === 'resource' &&
    rdfaAttrs.properties.filter(
      (prop) => prop.type === 'attribute' && predicate.matches(prop.predicate),
    )) ||
    []) as AttributeProperty[];
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
