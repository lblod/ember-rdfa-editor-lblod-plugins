import { WidgetSpec } from '@lblod/ember-rdfa-editor';
import { Structure } from '../utils/article-structure-plugin/constants';
import optionsWithDefaults from '../utils/article-structure-plugin/options-with-defaults';

export const articleStructureInsertWidget: (options?: {
  structures: (Structure | string)[];
}) => WidgetSpec = (options) => {
  return {
    componentName: 'article-structure-plugin/article-structure-card',
    desiredLocation: 'insertSidebar',
    widgetArgs: {
      options: optionsWithDefaults(options),
    },
  };
};

export const articleStructureContextWidget: (options?: {
  structures: (Structure | string)[];
}) => WidgetSpec = (options) => {
  return {
    componentName: 'article-structure-plugin/structure-card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      options: optionsWithDefaults(options),
    },
  };
};
