import { htmlSafe } from '@ember/template';
import { type Fragment, type PNode } from '@lblod/ember-rdfa-editor';

export type SafeString = ReturnType<typeof htmlSafe>;

export type AllOrNone<T> = T | { [K in keyof T]?: never };
export type ContentSpec = Fragment | PNode | PNode[];

export type ValueOf<T> = T[keyof T];
