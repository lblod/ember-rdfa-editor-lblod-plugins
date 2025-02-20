// TODO: move these utility functions to the `@lblod/ember-rdfa-editor` package

import { Transaction } from '@lblod/ember-rdfa-editor';

export function setCompositionID(tr: Transaction, compositionID: unknown) {
  return tr.setMeta('composition', compositionID);
}

export function getCompositionID(tr: Transaction): unknown {
  return tr.getMeta('composition');
}
