import { htmlSafe } from '@ember/template';
import { type Fragment, type PNode } from '@lblod/ember-rdfa-editor';

export type SafeString = ReturnType<typeof htmlSafe>;

export type ContentSpec = Fragment | PNode | PNode[];
