import { WidgetSpec } from '@lblod/ember-rdfa-editor';
import { VariableType } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-plugins/default-variable-types';

export interface DecisionOptions {
  publisher?: string;
  variableTypes?: (VariableType | string)[];
  defaultEndpoint?: string;
}

export function besluitPluginCardWidget(): WidgetSpec {
  return {
    componentName: 'besluit-plugin/besluit-plugin-card',
    desiredLocation: 'insertSidebar',
  };
}

export function besluitContextCardWidget(
  options: DecisionOptions = {}
): WidgetSpec {
  return {
    componentName: 'besluit-plugin/besluit-context-card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      options,
    },
  };
}
