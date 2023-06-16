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
  const { mappingResource, variableInstance, source, label } = node.attrs;

  const sourceSpan = source
    ? [
        [
          'span',
          {
            property: DCT('source').prefixed,
            resource: source as string,
          },
        ],
      ]
    : [];
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
    ['span', { property: DCT('type').prefixed, content: 'location' }],
    ...sourceSpan,
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
        const type = [...node.children]
          .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
          ?.getAttribute('content');
        if (mappingResource && type === 'location') {
          const variableInstance = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('instance')))
            ?.getAttribute('resource');
          const source = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', DCT('source')))
            ?.getAttribute('resource');
          const label = node.getAttribute('data-label') || type;
          return {
            variableInstance:
              variableInstance ??
              `http://data.lblod.info/variables/${uuidv4()}`,
            mappingResource,
            source,
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
  name: 'location-variable',
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
    source: {
      default: null,
    },
    label: {
      default: '',
    },
  },
  toDOM,
  parseDOM,
};

export const location_variable = createEmberNodeSpec(emberNodeConfig);
export const locationVariableView = createEmberNodeView(emberNodeConfig);
