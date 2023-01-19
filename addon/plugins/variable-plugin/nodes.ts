import { NodeSpec } from '@lblod/ember-rdfa-editor';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'], 
                          span[property~='${EXT('content').full}']`;
export const variable: NodeSpec = {
  content: 'inline*',
  group: 'inline',
  defining: true,
  inline: true,
  attrs: {
    mappingResource: {},
    variableResource: {
      default: null,
    },
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
    const { mappingResource, variableResource, type, datatype, source } =
      node.attrs;
    const sourceSpan = source
      ? [
          [
            'span',
            { property: DCT('source').prefixed, resource: source as string },
          ],
        ]
      : [];
    const variableResourceSpan = variableResource
      ? [
          [
            'span',
            {
              property: EXT('codelist').prefixed,
              resource: variableResource as string,
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
      ['span', { property: DCT('type').prefixed, content: type as string }],
      ...sourceSpan,
      ...variableResourceSpan,
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
    // Parse old dates correctly (backwards compatibility)
    {
      tag: 'span',
      getAttrs: (node: HTMLElement) => {
        if (hasRDFaAttribute(node, 'typeof', EXT('Mapping'))) {
          const variableType = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
            ?.getAttribute('content');
          const datatype = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('content')))
            ?.getAttribute('datatype');
          if (variableType === 'date' && datatype) {
            const mappingResource = node.getAttribute('resource');
            return { mappingResource, type: 'date' };
          }
        }
        return false;
      },
    },
    {
      tag: 'span',
      getAttrs: (node: HTMLElement) => {
        if (
          hasRDFaAttribute(node, 'typeof', EXT('Mapping')) &&
          node.querySelector(CONTENT_SELECTOR)
        ) {
          const mappingResource = node.getAttribute('resource');
          const variableResource = [...node.children]
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
          return { mappingResource, variableResource, source, type, datatype };
        }
        return false;
      },
      contentElement: CONTENT_SELECTOR,
    },
  ],
};
