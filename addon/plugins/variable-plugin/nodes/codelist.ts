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
  const { mappingResource, codelistResource, variableInstance, source, label } =
    node.attrs;

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
    },
    [
      'span',
      { property: EXT('instance'), resource: variableInstance as string },
    ],
    ['span', { property: DCT('type').prefixed, content: 'codelist' }],
    ...sourceSpan,
    ...codelistResourceSpan,
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
        if (mappingResource && type === 'codelist') {
          const variableInstance = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', EXT('instance')))
            ?.getAttribute('resource');
          const codelistSpan = [...node.children].find((el) =>
            hasRDFaAttribute(el, 'property', EXT('codelist'))
          );
          const codelistResource =
            codelistSpan?.getAttribute('resource') ??
            codelistSpan?.getAttribute('content');
          const source = [...node.children]
            .find((el) => hasRDFaAttribute(el, 'property', DCT('source')))
            ?.getAttribute('resource');
          const label = node.getAttribute('data-label') || type;
          return {
            variableInstance:
              variableInstance ??
              `http://data.lblod.info/variables/${uuidv4()}`,
            mappingResource,
            codelistResource,
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
  name: 'codelist-variable',
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
    label: {
      default: '',
    },
  },
  toDOM,
  parseDOM,
};

export const codelist_variable = createEmberNodeSpec(emberNodeConfig);
export const codelistVariableView = createEmberNodeView(emberNodeConfig);
