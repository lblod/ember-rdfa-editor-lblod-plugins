import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  DCT,
  EXT,
  RDF,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  EditorState,
  getRdfaAttrs,
  PNode,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import {
  hasRdfaVariableType,
  isVariable,
  parseLabel,
  parseVariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/attribute-parsers';
import type { ComponentLike } from '@glint/template';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { formatDate, validateDateFormat } from '../utils/date-helpers';
import DateNodeviewComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/nodeview';
import { v4 as uuidv4 } from 'uuid';
import {
  RdfaAttrs,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';

const TRANSLATION_FALLBACKS = {
  insertDate: 'Datum invoegen',
  insertDateTime: 'Datum en tijd invoegen',
  unknownFormat: 'Ongeldig formaat',
};

export type DateFormat = {
  label?: string;
  key: string;
  dateFormat: string;
  dateTimeFormat: string;
};

export type DateOptions = {
  formats: DateFormat[];
  allowCustomFormat: boolean;
};

const parseDOM = [
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
        hasRdfaVariableType(attrs, 'date')
      ) {
        if (attrs.rdfaNodeType !== 'resource') {
          return false;
        }

        const format = node.dataset.format;

        return {
          ...attrs,
          onlyDate: true,
          format: format,
          custom: node.dataset.custom === 'true',
          customAllowed: node.dataset.customAllowed !== 'false',
        };
      }
      return false;
    },
  },
  {
    /**
     * Parses dates in the form of e.g.:
     * <span datatype=XSD('date) content=.../>
     *
     * This is an older format, which we still parse.
     */
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (
        hasRDFaAttribute(node, 'datatype', XSD('date')) ||
        hasRDFaAttribute(node, 'datatype', XSD('dateTime'))
      ) {
        const onlyDate = hasRDFaAttribute(node, 'datatype', XSD('date'));
        const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
        const content = node.getAttribute('content');
        const properties = [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(
              `http://data.lblod.info/variables/${uuidv4()}`,
            ),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('date'),
          },
        ];
        if (content) {
          properties.push({
            predicate: EXT('content').full,
            object: sayDataFactory.literal(content),
          });
        }
        return {
          mappingResource,
          onlyDate,
          format: node.dataset.format,
          custom: node.dataset.custom === 'true',
          customAllowed: node.dataset.customAllowed !== 'false',
          rdfaNodeType: 'resource',
          subject: mappingResource,
          __rdfaId: uuidv4(),
          properties,
        };
      }
      return false;
    },
  },
  {
    /**
     * Parses dates in the new (variable) format
     */
    tag: 'span',
    getAttrs: (node: HTMLElement) => {
      if (isVariable(node) && parseVariableType(node) === 'date') {
        const mappingSubject = node.getAttribute('subject');
        if (!mappingSubject) {
          return false;
        }
        const onlyDate = !![...node.children].find((el) =>
          hasRDFaAttribute(el, 'datatype', XSD('date')),
        );
        const dateNode = [...node.children].find((el) =>
          hasRDFaAttribute(el, 'property', EXT('content')),
        ) as HTMLElement | undefined;
        const value = dateNode?.getAttribute('content');
        const format = dateNode?.dataset.format;
        const label = parseLabel(node);
        const properties = [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(
              `http://data.lblod.info/variables/${uuidv4()}`,
            ),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('date'),
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
          ...getRdfaAttrs(node),
          onlyDate,
          format: format,
          custom: dateNode?.dataset.custom === 'true',
          customAllowed: dateNode?.dataset.customAllowed !== 'false',
          rdfaNodeType: 'resource',
          subject: mappingSubject,
          __rdfaId: uuidv4(),
          properties,
        };
      }

      return false;
    },
  },
];

const serialize = (node: PNode, state: EditorState) => {
  const t = getTranslationFunction(state);
  const value = getOutgoingTriple(node.attrs, EXT('content'))?.object.value;
  const { onlyDate, format, custom, customAllowed } = node.attrs;
  let humanReadableDate: string;
  if (value) {
    if (validateDateFormat(format).type === 'ok') {
      humanReadableDate = formatDate(new Date(value), format);
    } else {
      humanReadableDate = t(
        'date-plugin.validation.unknown',
        TRANSLATION_FALLBACKS.unknownFormat,
      );
    }
  } else {
    humanReadableDate = (onlyDate as boolean)
      ? t('date-plugin.insert.date', TRANSLATION_FALLBACKS.insertDate)
      : t('date-plugin.insert.datetime', TRANSLATION_FALLBACKS.insertDateTime);
  }
  const dateAttrs = {
    'data-format': format as string,
    'data-custom': custom ? 'true' : 'false',
    'data-custom-allowed': customAllowed ? 'true' : 'false',
  };
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: dateAttrs,
    content: humanReadableDate,
  });
};

const emberNodeConfig = (options: DateOptions): EmberNodeConfig => ({
  name: 'date',
  group: 'inline variable',
  component: DateNodeviewComponent as unknown as ComponentLike,
  editable: true,
  inline: true,
  selectable: true,
  draggable: false,
  atom: true,
  defining: false,
  options,
  attrs: {
    format: {
      default: options.formats[0].dateFormat,
    },
    onlyDate: {
      default: true,
    },
    custom: {
      default: false,
    },
    customAllowed: {
      default: options.allowCustomFormat,
    },
    ...rdfaAttrSpec,
  },
  outlineText: (node: PNode, state: EditorState) => {
    const t = getTranslationFunction(state);
    const value = getOutgoingTriple(node.attrs as RdfaAttrs, EXT('content'))
      ?.object.value;
    const { onlyDate, format } = node.attrs;

    const humanReadableDate = value
      ? formatDate(new Date(value), format)
      : onlyDate
      ? t('date-plugin.insert.date', TRANSLATION_FALLBACKS.insertDate)
      : t('date-plugin.insert.datetime', TRANSLATION_FALLBACKS.insertDateTime);

    return humanReadableDate;
  },
  serialize,
  parseDOM,
});

export const date = (options: DateOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));
export const dateView = (options: DateOptions) =>
  createEmberNodeView(emberNodeConfig(options));
