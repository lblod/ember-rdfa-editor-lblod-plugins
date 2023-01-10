import { WidgetSpec } from '@lblod/ember-rdfa-editor';
import { TableOfContentsConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/utils/constants';

export function tableOfContentsWidget(
  config?: TableOfContentsConfig
): WidgetSpec {
  return {
    componentName: 'table-of-contents-plugin/card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      config,
    },
  };
}
