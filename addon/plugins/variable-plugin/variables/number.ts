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
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
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
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

const parseDOM: ParseRule[] = [
  {
    tag: 'span',
    getAttrs(node: HTMLElement) {
      const attrs = getRdfaAttrs(node);
      if (!attrs) {
        return false;
      }
      if (
        hasOutgoingNamedNodeTriple(attrs, RDF('type'), EXT('Mapping')) &&
        node.querySelector('[data-content-container="true"]') &&
        hasRdfaVariableType(attrs, 'number')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
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
        const mappingSubject = node.getAttribute('subject');
        if (!mappingSubject) {
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
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(
              variableInstance ??
                `http://data.lblod.info/variables/${uuidv4()}`,
            ),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('number'),
          },
        ];
        if (label) {
          properties.push({
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label),
          });
        }
        if (value) {
          properties.push({
            predicate: EXT('content').full,
            object: sayDataFactory.literal(value),
          });
        }
        return {
          writtenNumber,
          minimumValue,
          maximumValue,
          subject: mappingSubject,
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
  const value = getOutgoingTriple(node.attrs, EXT('content'))?.object.value;

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
