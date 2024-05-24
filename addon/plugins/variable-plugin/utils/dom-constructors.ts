// This file contains helper functions used to create DOMOutputSpec objects
import { Attrs, DOMOutputSpec } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';

/**
 * Constructs a variable mapping span based on a mapping resource.
 * This function also accepts additional attributes which are added to the span attributes, and a series of children.
 */
export const mappingSpan = (
  mapping: string,
  attributes: Attrs,
  ...children: (DOMOutputSpec | 0)[]
) => {
  return span(
    {
      resource: mapping,
      typeof: EXT('Mapping').prefixed,
      ...attributes,
    },
    ...children,
  );
};

/**
 * Constructs a variable instance span based on a variable-instance resource.
 */
export const instanceSpan = (variableInstance: string) => {
  return span({ property: EXT('instance'), resource: variableInstance });
};

/**
 * Constructs a variable type span based on a variable type.
 */
export const typeSpan = (variableType: string) => {
  return span({ property: DCT('type').prefixed, content: variableType });
};

/**
 * Constructs a variable source span based on a variable source.
 */
export const sourceSpan = (variableSource: string) => {
  return span({
    property: DCT('source').prefixed,
    resource: variableSource,
  });
};
