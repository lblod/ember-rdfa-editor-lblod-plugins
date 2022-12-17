import { WidgetSpec } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import optionsWithDefaults from '../utils/article-structure-plugin/options-with-defaults';

export type Structure = {
  uriBase: string;
  title: string;
  type: string;
  numberPredicate: string;
  numbering?: string;
  numberingFunction?: (num: number) => string;
  heading?: string;
  translation: string;
  moveUp: string;
  moveDown: string;
  insertPredicate?: {
    long: string;
    short: string;
  };
  shaclConstraint: string;
  template: (uri: string, intlService: IntlService) => string;
};

export type ArticleStructurePluginOptions = {
  structures: Structure[];
};

export type ResolvedArticleStructurePluginOptions = {
  structures: Structure[];
  structureTypes: string[];
};

export const articleStructureInsertWidget: (
  options?: ArticleStructurePluginOptions
) => WidgetSpec = (options) => {
  return {
    componentName: 'article-structure-plugin/article-structure-card',
    desiredLocation: 'insertSidebar',
    widgetArgs: {
      options: optionsWithDefaults(options),
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
      options: optionsWithDefaults(options),
    },
  };
};
