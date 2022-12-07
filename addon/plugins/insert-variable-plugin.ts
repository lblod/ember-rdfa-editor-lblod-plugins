import { WidgetSpec } from '@lblod/ember-rdfa-editor';

export function insertVariableWidget(options?: unknown): WidgetSpec {
  return {
    componentName: 'insert-variable-plugin/insert-variable-card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      options,
    },
  };
}
