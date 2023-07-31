import { DOMOutputSpec } from '@lblod/ember-rdfa-editor';

export const span = (
  attributes: Record<string, unknown> = {},
  ...children: unknown[]
): DOMOutputSpec => {
  return ['span', attributes, ...children];
};
