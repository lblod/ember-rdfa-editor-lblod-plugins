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
import {
  MAXIMUM_VALUE_HTML_ATTRIBUTE_KEY,
  MAXIMUM_VALUE_PNODE_KEY,
  MINIMUM_VALUE_HTML_ATTRIBUTE_KEY,
  MINIMUM_VALUE_PNODE_KEY,
} from './utils/constants';
import { PNode } from '@lblod/ember-rdfa-editor';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;

export const getHTMLNodeExtraAttributes = ({
  node,
  type,
}: {
  node: HTMLElement;
  type: string;
}) => {
  if (type === 'number') {
    return {
      [MINIMUM_VALUE_PNODE_KEY]:
        node.getAttribute(MINIMUM_VALUE_HTML_ATTRIBUTE_KEY) ?? null,
      [MAXIMUM_VALUE_PNODE_KEY]:
        node.getAttribute(MAXIMUM_VALUE_HTML_ATTRIBUTE_KEY) ?? null,
    };
  }

  return {};
};

export const getPNodeExtraAttributes = ({
  node,
  type,
}: {
  node: PNode;
  type: string;
}) => {
  if (type === 'number') {
    return {
      [MINIMUM_VALUE_HTML_ATTRIBUTE_KEY]:
        (node.attrs[MINIMUM_VALUE_PNODE_KEY] as string) ?? null,
      [MAXIMUM_VALUE_HTML_ATTRIBUTE_KEY]:
        (node.attrs[MAXIMUM_VALUE_PNODE_KEY] as string) ?? null,
    };
  }

  return {};
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'variable',
  componentPath: 'variable-plugin/variable',
  inline: true,
  group: 'inline',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  draggable: false,
  needsFFKludge: true,
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
  toDOM: (node) => {
    const {
      mappingResource,
      codelistResource,
      variableInstance,
      type,
      datatype,
      source,
      label,
    } = node.attrs;

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
        'data-label': label as string,
        ...getPNodeExtraAttributes({ node, type: type as string }),
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
          const codelistSpan = [...node.children].find((el) =>
            hasRDFaAttribute(el, 'property', EXT('codelist'))
          );
          const codelistResource =
            codelistSpan?.getAttribute('resource') ??
            codelistSpan?.getAttribute('content');
          const source = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', DCT('source')))
            ?.getAttribute('resource');
          const type = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', DCT('type')))
            ?.getAttribute('content');
          const label = node.getAttribute('data-label') || type;
          const datatype = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('content')))
            ?.getAttribute('datatype');
          if (!mappingResource || !type) {
            return false;
          }
          return {
            variableInstance:
              variableInstance ??
              `http://data.lblod.info/variables/${uuidv4()}`,
            mappingResource,
            codelistResource,
            source,
            type,
            datatype,
            label,
            ...getHTMLNodeExtraAttributes({ type, node }),
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
