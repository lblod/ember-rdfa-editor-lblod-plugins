import { WidgetSpec } from '@lblod/ember-rdfa-editor';

export type TableOfContentsConfig = {
  path: string[];
}[];

export const tableOfContentsWidget: WidgetSpec = {
  componentName: 'table-of-contents-plugin/card',
  desiredLocation: 'sidebar',
};
