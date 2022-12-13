import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';

export function besluitPluginCardWidget(config: unknown): WidgetSpec {
  return {
    componentName: 'besluit-plugin/besluit-plugin-card',
    desiredLocation: 'insertSidebar',
    widgetArgs: {
      config,
    },
  };
}

export function besluitContextCardWidget(config: unknown): WidgetSpec {
  return {
    componentName: 'besluit-plugin/besluit-context-card',
    desiredLocation: 'sidebar',
    widgetArgs: {
      config,
    },
  };
}
