import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  DOMOutputSpec,
  EditorState,
  getRdfaAttrs,
  ParseRule,
  PNode,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import {
  getParsedRDFAAttribute,
  hasParsedRDFaAttribute,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { isNumber } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { numberToWords } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/number-to-words';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableInstance,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import { v4 as uuidv4 } from 'uuid';
import NumberNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/nodeview';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';

const parseDOM: ParseRule[] = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node);
      console.log('attrs', attrs);
      if (
        hasParsedRDFaAttribute(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector('[data-content-container="true"]') &&
        hasRdfaVariableType(attrs, 'number')
      ) {
        if (!attrs.subject) {
          return false;
        }
        const writtenNumber =
          node.getAttribute('data-written-number') === 'true' ? true : false;
        const minimumValue = node.getAttribute('data-minimum-value');
        const maximumValue = node.getAttribute('data-maximum-value');
        return {
          ...attrs,
          writtenNumber,
          minimumValue,
          maximumValue,
        };
      }
      return false;
    },
  },
  {
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (isVariable(node) && parseVariableType(node) === 'number') {
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

        const properties = [
          {
            type: 'attribute',
            predicate: RDF('type').full,
            object: EXT('Mapping').full,
          },
          {
            type: 'attribute',
            predicate: EXT('instance').full,
            object:
              variableInstance ??
              `http://data.lblod.info/variables/${uuidv4()}`,
          },
          {
            type: 'attribute',
            predicate: DCT('type').full,
            object: 'number',
          },
        ];
        if (label) {
          properties.push({
            type: 'attribute',
            predicate: EXT('label').full,
            object: label,
          });
        }
        if (value) {
          properties.push({
            type: 'attribute',
            predicate: EXT('content').full,
            object: value,
          });
        }
        return {
          writtenNumber,
          minimumValue,
          maximumValue,
          subject: mappingResource,
          rdfaNodeType: 'resource',
          __rdfaId: uuidv4(),
          properties,
        };
      } else {
        return false;
      }
    },
  },
];

const serialize = (node: PNode, state: EditorState): DOMOutputSpec => {
  const t = getTranslationFunction(state);
  const docLang = state.doc.attrs.lang as string;
  const { writtenNumber, minimumValue, maximumValue } = node.attrs;
  const value = getParsedRDFAAttribute(node.attrs, EXT('content'))?.object;

  let humanReadableContent: string;

  if (isNumber(value)) {
    if (writtenNumber) {
      humanReadableContent = numberToWords(Number(value), { lang: docLang });
    } else {
      humanReadableContent = value as string;
    }
  } else {
    humanReadableContent = t('variable.number.placeholder', 'Voeg getal in');
  }

  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: {
      'data-written-number': String(writtenNumber ?? false),
      'data-minimum-value': (minimumValue as string) ?? null,
      'data-maximum-value': (maximumValue as string) ?? null,
    },
    content: humanReadableContent.toString(),
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'number',
  component: NumberNodeviewComponent as unknown as ComponentLike,
  inline: true,
  group: 'inline variable',
  content: 'inline*',
  atom: true,
  recreateUri: true,
  uriAttributes: ['variableInstance'],
  editable: true,
  draggable: false,
  needsFFKludge: true,
  attrs: {
    ...rdfaAttrSpec,
    writtenNumber: { default: false },
    minimumValue: { default: null },
    maximumValue: { default: null },
  },
  leafText: (node: PNode) => {
    const { value } = node.attrs;
    return value as string;
  },
  parseDOM,
  serialize,
};

export const number = createEmberNodeSpec(emberNodeConfig);
export const numberView = createEmberNodeView(emberNodeConfig);
