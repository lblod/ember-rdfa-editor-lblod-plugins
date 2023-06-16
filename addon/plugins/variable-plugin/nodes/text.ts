import { DOMOutputSpec, PNode, ParseRule } from '@lblod/ember-rdfa-editor';
import { CONTENT_SELECTOR } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import {
  DCT,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  EmberNodeConfig,
  createEmberNodeSpec,
  createEmberNodeView,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';

const toDOM: (node: PNode) => DOMOutputSpec = (node) => {
  const { mappingResource, variableInstance, label } = node.attrs;
  return [
    'span',
    {
      resource: mappingResource as string,
      typeof: EXT('Mapping').prefixed,
      'data-label': label as string,
    },
    [
      'span',
      { property: EXT('instance'), resource: variableInstance as string },
    ],
    ['span', { property: DCT('type').prefixed, content: 'text' }],
    [
      'span',
      {
        property: EXT('content').prefixed,
      },
      0,
    ],
  ];
};

const parseDOM: ParseRule[] = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        hasRDFaAttribute(node, 'typeof', EXT('Mapping')) &&
        node.querySelector(CONTENT_SELECTOR)
      ) {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const type = [...node.children]
          .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
          ?.getAttribute('content');
        if (type === 'text') {
          const variableInstance = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('instance')))
            ?.getAttribute('resource');

          const label = node.getAttribute('data-label') || type;
          return {
            variableInstance:
              variableInstance ??
              `http://data.lblod.info/variables/${uuidv4()}`,
            mappingResource,
            label,
          };
        }
      }
      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const emberNodeConfig: EmberNodeConfig = {
  name: 'text-variable',
  componentPath: 'variable-plugin/variable',
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
  attrs: {
    mappingResource: {},
    variableInstance: {},
    label: {
      default: '',
    },
  },
  toDOM,
  parseDOM,
};

export const text_variable = createEmberNodeSpec(emberNodeConfig);
export const textVariableView = createEmberNodeView(emberNodeConfig);
