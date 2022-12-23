import {
  Fragment,
  PNode,
  Schema,
  WidgetSpec,
  EditorState,
} from '@lblod/ember-rdfa-editor';
import { Transaction } from 'prosemirror-state';
import { STRUCTURE_SPECS } from './structures';

type SpecName = string;

export type StructureSpec = {
  name: SpecName;
  context: SpecName[];
  constructor: (schema: Schema, number: number) => PNode;
  updateNumber: (
    number: number,
    pos: number,
    transaction: Transaction
  ) => Transaction;
  content: (pos: number, state: EditorState) => Fragment;
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
