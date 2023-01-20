import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'], 
                          span[property~='${EXT('content').full}']`;

const emberNodeConfig: EmberNodeConfig = {
  name: 'variable',
  componentPath: 'variable-plugin/variable',
  inline: true,
  group: 'inline',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['mappingResource'],
  draggable: false,
  attrs: {
    mappingResource: {},
    codelistResource: {
      default: null,
    },
    variableInstance: {},
    source: {
      default: null,
    },
    type: {
      default: 'text',
    },
    datatype: {
      default: null,
    },
  },
  toDOM: (node) => {
    const {
      mappingResource,
      codelistResource,
      variableInstance,
      type,
      datatype,
      source,
    } = node.attrs;
    const sourceSpan = source
      ? [
          [
            'span',
            { property: DCT('source').prefixed, resource: source as string },
          ],
        ]
      : [];
    const codelistResourceSpan = codelistResource
      ? [
          [
            'span',
            {
              property: EXT('codelist').prefixed, //becomes EXT('instance')
              resource: codelistResource as string,
            },
          ],
        ]
      : [];
    return [
      'span',
      {
        resource: mappingResource as string,
        typeof: EXT('Mapping').prefixed,
      },
      [
        'span',
        { property: EXT('instance'), resource: variableInstance as string },
      ],
      ['span', { property: DCT('type').prefixed, content: type as string }],
      ...sourceSpan,
      ...codelistResourceSpan,
      [
        'span',
        {
          property: EXT('content').prefixed,
          ...(!!datatype && { datatype: datatype as string }),
        },
        0,
      ],
    ];
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs: (node: HTMLElement) => {
        if (
          hasRDFaAttribute(node, 'typeof', EXT('Mapping')) &&
          node.querySelector(CONTENT_SELECTOR)
        ) {
          const variableInstance = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('instance')))
            ?.getAttribute('resource');
          const mappingResource = node.getAttribute('resource');
          const codelistResource = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('codelist')))
            ?.getAttribute('resource');
          const source = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', DCT('source')))
            ?.getAttribute('resource');
          const type = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
            ?.getAttribute('content');
          const datatype = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('content')))
            ?.getAttribute('datatype');
          return {
            variableInstance:
              variableInstance ??
              `http://data.lblod.info/variables/${uuidv4()}`,
            mappingResource,
            codelistResource,
            source,
            type,
            datatype,
          };
        }
        return false;
      },
      contentElement: CONTENT_SELECTOR,
    },
  ],
};

export const variable = createEmberNodeSpec(emberNodeConfig);
export const variableView = createEmberNodeView(emberNodeConfig);
