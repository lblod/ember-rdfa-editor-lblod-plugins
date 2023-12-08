import { Property } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { getRdfaAttrs } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export function isVariable(element: HTMLElement) {
  return hasRDFaAttribute(element, 'typeof', EXT('Mapping'));
}

export function isVariableNew(element: HTMLElement) {
  const rdfaAttrs = getRdfaAttrs(element);
  if (!rdfaAttrs || rdfaAttrs.rdfaNodeType === 'literal') {
    return false;
  }
  const { properties } = rdfaAttrs;
  const typeOfProperty = properties.find((property) => {
    if (!RDF('type').equals(property.predicate)) {
      return false;
    }
    const { type, object } = property;
    if (type === 'attribute') {
      return EXT('Variable').equals(object);
    } else if (object.type === 'resource') {
      return EXT('Variable').equals(object.resource);
    } else {
      return false;
    }
  });
  return !!typeOfProperty;
}

export function parseVariableType(variableNode: HTMLElement) {
  return [...variableNode.children]
    .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
    ?.getAttribute('content');
}

export function parseVariableTypeNew(element: HTMLElement) {
  const rdfaAttrs = getRdfaAttrs(element);
  if (!rdfaAttrs || rdfaAttrs.rdfaNodeType === 'literal') {
    return;
  }
  const { properties } = rdfaAttrs;
  for (const property of properties) {
    if (!DCT('type').equals(property.predicate)) {
      continue;
    }
    const { type, object } = property;
    if (type === 'attribute') {
      return object;
    } else if (object.type === 'literal') {
      return (
        resolveChildLiteral(element, object.rdfaId)?.textContent ?? undefined
      );
    }
  }
  return;
}

export function parseVariableInstance(variableNode: HTMLElement) {
  return [...variableNode.children]
    .find((el) => hasRDFaAttribute(el, 'property', EXT('instance')))
    ?.getAttribute('resource');
}

export function parseLabel(variableNode: HTMLElement) {
  return variableNode.getAttribute('data-label');
}

export function parseVariableSource(variableNode: HTMLElement) {
  return [...variableNode.children]
    .find((el) => hasRDFaAttribute(el, 'property', DCT('source')))
    ?.getAttribute('resource');
}

export function parseSelectionStyle(element: HTMLElement): string | null {
  return element.dataset.selectionStyle ?? null;
}

export function filterOutContentProperties(properties: Property[]) {
  return properties.filter((property) => {
    return !EXT('content').equals(property.predicate);
  });
}

function resolveChildLiteral(element: HTMLElement, rdfaId: string) {
  return element.querySelector(`[__rdfaId='${rdfaId}']`);
}

