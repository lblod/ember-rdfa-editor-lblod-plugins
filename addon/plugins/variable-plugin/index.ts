import { WidgetSpec } from '@lblod/ember-rdfa-editor';

export function insertVariableWidget(options?: unknown): WidgetSpec {
  return {
    componentName: 'variable-plugin/insert-variable-card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      options,
    },
  };
}

export const templateVariableWidget: WidgetSpec = {
  componentName: 'variable-plugin/template-variable-card',
  desiredLocation: 'sidebar',
};
