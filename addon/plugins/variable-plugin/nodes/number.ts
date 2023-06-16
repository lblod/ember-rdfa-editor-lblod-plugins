import { DOMOutputSpec, PNode, ParseRule } from '@lblod/ember-rdfa-editor';
import { CONTENT_SELECTOR } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import {
  DCT,
  EXT,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  EmberNodeConfig,
  createEmberNodeSpec,
  createEmberNodeView,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';

const toDOM: (node: PNode) => DOMOutputSpec = (node: PNode) => {
  const {
    mappingResource,
    variableInstance,
    label,
    minimumValue,
    maximumValue,
  } = node.attrs;
  return [
    'span',
    {
      resource: mappingResource as string,
      typeof: EXT('Mapping').prefixed,
      'data-label': label as string,
      'data-minimum-value': minimumValue as number,
      'data-maximum-value': maximumValue as number,
    },
    [
      'span',
      { property: EXT('instance'), resource: variableInstance as string },
    ],
    ['span', { property: DCT('type').prefixed, content: 'number' }],
    [
      'span',
      {
        property: EXT('content').prefixed,
        datatype: XSD('integer').prefixed,
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
        if (type === 'number') {
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
            minimumValue: node.dataset.minimumValue,
            maximumValue: node.dataset.maximumValue,
          };
        }
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const emberNodeConfig: EmberNodeConfig = {
  name: 'number-variable',
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
    minimumValue: {
      default: null,
    },
    maximumValue: {
      default: null,
    },
  },
  toDOM,
  parseDOM,
};

export const number_variable = createEmberNodeSpec(emberNodeConfig);
export const numberVariableView = createEmberNodeView(emberNodeConfig);
