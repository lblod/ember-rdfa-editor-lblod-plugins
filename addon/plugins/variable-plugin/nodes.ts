import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  EXT,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Fragment, NodeSpec } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export const date_variable: NodeSpec = {
  group: 'inline',
  content: 'date',
  inline: true,
  attrs: {
    mappingResource: {},
  },
  toDOM: (node) => {
    const { mappingResource } = node.attrs;
    return [
      'span',
      {
        resource: mappingResource as string,
        typeof: EXT('Mapping').prefixed,
      },
      ['span', { property: DCT('type').prefixed, content: 'date' }],
      [
        'span',
        {
          property: EXT('content').prefixed,
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
            return { mappingResource };
          }
        }
        return false;
      },
      getContent(node: Element, schema) {
        const dateNode = unwrap(
          [...node.children].find((el) =>
            hasRDFaAttribute(el, 'property', EXT('content'))
          )
        );
        const onlyDate = !hasRDFaAttribute(node, 'datatype', XSD('dateTime'));
        const dateValue = dateNode?.getAttribute('content');
        return Fragment.from(schema.nodes.date.create({ onlyDate, dateValue }));
      },
    },
    {
      tag: 'span',
      getAttrs: (node: HTMLElement) => {
        if (hasRDFaAttribute(node, 'typeof', EXT('Mapping'))) {
          const variableType = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
            ?.getAttribute('content');
          if (variableType === 'date') {
            const mappingResource = node.getAttribute('resource');
            return { mappingResource };
          }
        }
        return false;
      },
      contentElement: `span[property~='${EXT('content').prefixed}'], 
                       span[property~='${EXT('content').full}']`,
    },
  ],
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'variable',
  componentPath: 'variable-plugin/variable',
  inline: true,
  group: 'inline',
  content: 'inline*',
  atom: true,
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
    {
      tag: 'span',
      getAttrs: (node: HTMLElement) => {
        if (hasRDFaAttribute(node, 'typeof', EXT('Mapping'))) {
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
      contentElement: `span[property~='${EXT('content').prefixed}'], 
                       span[property~='${EXT('content').full}']`,
    },
  ],
};

export const variable = createEmberNodeSpec(emberNodeConfig);
export const variableView = createEmberNodeView(emberNodeConfig);
