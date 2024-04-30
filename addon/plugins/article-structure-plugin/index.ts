import {
  EditorState,
  Fragment,
  PNode,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import type { Resource } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export type SpecName = string;

export type SpecConstructorResult = {
  node: PNode;
  selectionConfig: {
    rdfaId: string;
    type: 'node' | 'text';
  };
  newResource: string;
};

export type StructureSpec = {
  name: SpecName;
  translations: {
    insert: string;
    move?: {
      up?: string;
      down?: string;
    };
    remove?: string;
    removeWithContent?: string;
  };
  constructor: (args: {
    schema: Schema;
    number?: number;
    intl?: IntlService;
    content?: PNode | Fragment;
    state?: EditorState;
  }) => SpecConstructorResult;
  numberConfig: {
    numberPredicate?: Resource;
    convertNumber?: (number: number) => string;
  };
  setNumber: (args: {
    number: number;
    pos: number;
    transaction: Transaction;
  }) => Transaction;
  getNumber: (args: { pos: number; transaction: Transaction }) => number | null;
  setStartNumber?: (args: {
    number: number | null;
    pos: number;
    transaction: Transaction;
  }) => Transaction;
  getStartNumber?: (args: {
    pos: number;
    transaction: Transaction;
  }) => number | null;
  content?: (args: { pos: number; state: EditorState }) => Fragment;
  continuous: boolean;
  limitTo?: string;
  noUnwrap?: boolean;
  relationshipPredicate?: Resource;
};

export type ArticleStructurePluginOptions = StructureSpec[];
