import {
  EditorState,
  Fragment,
  PNode,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';

export type SpecName = string;

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
  }) => {
    node: PNode;
    selectionConfig: {
      relativePos: number;
      type: 'node' | 'text';
    };
  };
  updateNumber: (args: {
    number: number;
    pos: number;
    transaction: Transaction;
  }) => Transaction;
  content?: (args: { pos: number; state: EditorState }) => Fragment;
  continuous: boolean;
  limitTo?: string;
  noUnwrap?: boolean;
};

export type ArticleStructurePluginOptions = StructureSpec[];
