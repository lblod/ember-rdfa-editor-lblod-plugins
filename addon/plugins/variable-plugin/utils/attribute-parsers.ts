import {
  DCT,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export function isVariable(element: HTMLElement) {
  return hasRDFaAttribute(element, 'typeof', EXT('Mapping'));
}

export function parseVariableType(variableNode: HTMLElement) {
  return [...variableNode.children]
    .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
    ?.getAttribute('content');
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
