import { Attrs, DOMOutputSpec } from '@lblod/ember-rdfa-editor';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export const span = (
  attributes: Attrs = {},
  ...children: (DOMOutputSpec | string | 0)[]
): DOMOutputSpec => {
  return ['span', attributes, ...children];
};

/**
 * Constructs a variable content span. Accepts optional additional attributes and a series of children.
 */
export const contentSpan = (
  attributes: Attrs,
  ...children: (DOMOutputSpec | string | 0)[]
) => {
  return span(
    {
      property: EXT('content').prefixed,
      ...attributes,
    },
    ...children,
  );
};
