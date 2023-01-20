import {
  Fragment,
  PNode,
  Schema,
  WidgetSpec,
  EditorState,
} from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { Transaction } from '@lblod/ember-rdfa-editor';
import { STRUCTURE_SPECS } from './structures';

export type SpecName = string;

export type StructureSpec = {
  name: SpecName;
  // context: SpecName[];
  translations: {
    insert: string;
    move: {
      up: string;
      down: string;
    };
    remove: string;
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
};

export type ArticleStructurePluginOptions = StructureSpec[];

export const articleStructureInsertWidget: (
  options?: ArticleStructurePluginOptions
) => WidgetSpec = (options) => {
  return {
    componentName: 'article-structure-plugin/article-structure-card',
    desiredLocation: 'insertSidebar',
    widgetArgs: {
      options: options ?? STRUCTURE_SPECS,
    },
  };
};

export const articleStructureContextWidget: (
  options?: ArticleStructurePluginOptions
) => WidgetSpec = (options) => {
  return {
    componentName: 'article-structure-plugin/structure-card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      options: options ?? STRUCTURE_SPECS,
    },
  };
};
