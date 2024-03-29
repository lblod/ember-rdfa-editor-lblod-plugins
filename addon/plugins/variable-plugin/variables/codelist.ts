import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuidv4 } from 'uuid';
import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
import {
  isVariable,
  parseLabel,
  parseSelectionStyle,
  parseVariableInstance,
  parseVariableSource,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import {
  contentSpan,
  instanceSpan,
  mappingSpan,
  sourceSpan,
  typeSpan,
} from '../utils/dom-constructors';
import { span } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-output-spec-helpers';
import VariableNodeViewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/variable/nodeview';
import type { ComponentLike } from '@glint/template';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;

const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        isVariable(node) &&
        node.querySelector(CONTENT_SELECTOR) &&
        parseVariableType(node) === 'codelist'
      ) {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);

        const source = parseVariableSource(node);
        const label = parseLabel(node);
        const selectionStyle = parseSelectionStyle(node);
        const codelistSpan = [...node.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('codelist')),
        );
        const codelistResource =
          codelistSpan?.getAttribute('resource') ??
          codelistSpan?.getAttribute('content');
        return {
          variableInstance:
            variableInstance ?? `http://data.lblod.info/variables/${uuidv4()}`,
          mappingResource,
          selectionStyle,
          codelistResource,
          source,
          label,
        };
      }

      return false;
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const {
    mappingResource,
    codelistResource,
    variableInstance,
    source,
    label,
    selectionStyle,
  } = node.attrs;

  const codelistResourceSpan = codelistResource
    ? span({
        property: EXT('codelist').prefixed, //becomes EXT('instance')
        resource: codelistResource as string,
      })
    : '';
  return mappingSpan(
    mappingResource,
    {
      'data-label': label as string,
      'data-selection-style': selectionStyle as string,
    },
    instanceSpan(variableInstance),
    typeSpan('codelist'),
    source ? sourceSpan(source) : '',
    codelistResourceSpan,
    contentSpan({}, 0),
  );
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'codelist',
  component: VariableNodeViewComponent as unknown as ComponentLike,
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
    codelistResource: {
      default: null,
    },
    variableInstance: {},
    source: {
      default: null,
    },
    label: { default: null },
    selectionStyle: {
      default: null,
    },
  },
  toDOM,
  parseDOM,
};

export const codelist = createEmberNodeSpec(emberNodeConfig);
export const codelistView = createEmberNodeView(emberNodeConfig);
