import { WidgetSpec } from '@lblod/ember-rdfa-editor';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

export const customRdfaWidget: WidgetSpec = {
  componentName: 'custom-rdfa-plugin/custom-rdfa-card',
  desiredLocation: 'sidebar',
};

export const insertCustomRdfaWidget: WidgetSpec = {
  componentName: 'custom-rdfa-plugin/insert-custom-rdfa',
  desiredLocation: 'insertSidebar',
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'custom_rdfa',
  componentPath: 'custom-rdfa-plugin/custom-rdfa',
  inline: true,
  group: 'inline',
  content: 'inline*',
  atom: true,
  draggable: false,
  attrs: {
    typeof: {
      default: null,
    },
    resource: {
      default: 'text',
    },
    property: {
      default: 'text',
    },
  },
  toDOM: (node) => {
    const { typeof: type, resource, property } = node.attrs;
    return [
      'span',
      {
        typeof: type as string,
        resource: resource as string,
        property: property as string,
      },
      0,
    ];
  },
  parseDOM: [
    {
      tag: 'span',
      priority: 40,
      getAttrs: (node: HTMLElement) => {
        return {
          typeof: node.getAttribute('typeof'),
          resource: node.getAttribute('resource'),
          property: node.getAttribute('property'),
        };
      },
    },
  ],
};

export const custom_rdfa = createEmberNodeSpec(emberNodeConfig);
export const customRdfaView = createEmberNodeView(emberNodeConfig);
