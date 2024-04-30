import {
  DCT,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getOutgoingTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { RdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';

export function isVariable(element: HTMLElement) {
  return hasRDFaAttribute(element, 'typeof', EXT('Mapping'));
}

export function parseVariableType(variableNode: HTMLElement) {
  return [...variableNode.children]
    .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
    ?.getAttribute('content');
}
export function getRdfaVariableType(rdfaAttrs: RdfaAttrs): string | null {
  const attr = getOutgoingTriple(rdfaAttrs, DCT('type'));
  if (attr && attr.object.value) {
    return attr.object.value;
  }
  return null;
}
export function hasRdfaVariableType(rdfaAttrs: RdfaAttrs, type: string) {
  const attrType = getRdfaVariableType(rdfaAttrs);
  if (attrType) {
    return attrType === type;
  }
  return false;
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
