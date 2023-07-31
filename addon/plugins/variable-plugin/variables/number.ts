import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
import { hasRDFaAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  EXT,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { isNumber } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { numberToWords } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/number-to-words';
import {
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import { v4 as uuidv4 } from 'uuid';
import {
  contentSpan,
  instanceSpan,
  mappingSpan,
  typeSpan,
} from '../utils/dom-constructors';

const CONTENT_SELECTOR = `span[property~='${EXT('content').prefixed}'],
                          span[property~='${EXT('content').full}']`;

const parseDOM = [
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        isVariable(node) &&
        node.querySelector(CONTENT_SELECTOR) &&
        parseVariableType(node) === 'number'
      ) {
        const mappingResource = node.getAttribute('resource');
        if (!mappingResource) {
          return false;
        }
        const variableInstance = parseVariableInstance(node);
        const label = parseLabel(node);
        const value = [...node.children]
          .find((el) => hasRDFaAttribute(el, 'property', EXT('content')))
          ?.getAttribute('content');
        const writtenNumber =
          node.getAttribute('data-written-number') === 'true' ? true : false;
        const minimumValue = node.getAttribute('data-minimum-value');
        const maximumValue = node.getAttribute('data-maximum-value');
        return {
          variableInstance:
            variableInstance ?? `http://data.lblod.info/variables/${uuidv4()}`,
          mappingResource,
          label,
          writtenNumber,
          minimumValue,
          maximumValue,
          value,
        };
      } else {
        return false;
      }
    },
    contentElement: CONTENT_SELECTOR,
  },
];

const toDOM = (node: PNode): DOMOutputSpec => {
  const {
    mappingResource,
    variableInstance,
    label,
    writtenNumber,
    minimumValue,
    maximumValue,
    value,
  } = node.attrs;

  let humanReadableContent: string;

  if (isNumber(value)) {
    if (writtenNumber) {
      humanReadableContent = numberToWords(Number(value), { lang: 'nl' });
    } else {
      humanReadableContent = value as string;
    }
  } else {
    humanReadableContent = 'Voeg getal in';
  }

  return mappingSpan(
    mappingResource,
    {
      'data-label': label as string,
      'data-written-number': String(writtenNumber ?? false),
      'data-minimum-value': (minimumValue as string) ?? null,
      'data-maximum-value': (maximumValue as string) ?? null,
    },
    instanceSpan(variableInstance),
    typeSpan('number'),
    contentSpan(
      {
        content: (value as string | null) ?? '',
        datatype: XSD('integer').prefixed,
      },
      humanReadableContent,
    ),
  );
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'number',
  componentPath: 'variable-plugin/number/nodeview',
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
      default: 'nummer',
    },
    value: { default: null },
    writtenNumber: { default: false },
    minimumValue: { default: null },
    maximumValue: { default: null },
  },
  leafText: (node: PNode) => {
    const { value } = node.attrs;
    return value as string;
  },
  parseDOM,
  toDOM,
};

export const number = createEmberNodeSpec(emberNodeConfig);
export const numberView = createEmberNodeView(emberNodeConfig);
