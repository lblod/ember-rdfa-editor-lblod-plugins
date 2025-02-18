import type { ComponentLike } from '@glint/template';
import {
  EditorState,
  PNode,
  getRdfaAttrs,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import Structure from '@lblod/ember-rdfa-editor-lblod-plugins/components/structure-plugin/_private/structure';
import {
  BESLUIT,
  ELI,
  EXT,
  PROV,
  RDF,
  SAY,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { getIntlService } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  getRdfaContentElement,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import IntlService from 'ember-intl/services/intl';
import { romanize, romanToInt } from './utils/romanize';
import {
  STRUCTURE_HIERARCHY,
  StructurePluginOptions,
  StructureType,
} from './structure-types';
import { parseBooleanDatasetAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-utils';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

const rdfaAware = true;

export function getNameForStructureType(
  structureType: StructureType,
  number: number,
  fullLengthArticles?: boolean,
  intl?: IntlService,
  locale?: string,
) {
  if (intl?.exists(`structure-plugin.types.${structureType}`, locale)) {
    if (structureType === 'article' && number !== 1 && !fullLengthArticles) {
      return intl?.t(`structure-plugin.shortened-article`, { locale });
    } else {
      return intl?.t(`structure-plugin.types.${structureType}`, { locale });
    }
  } else {
    return structureType;
  }
}

function getNumberForDisplay(number: number, romanizeNumber: boolean): string {
  if (romanizeNumber) {
    return romanize(number);
  } else {
    return number.toString();
  }
}

export const emberNodeConfig: (
  config?: StructurePluginOptions,
) => EmberNodeConfig = (config) => {
  return {
    name: 'structure',
    component: Structure as unknown as ComponentLike,
    inline: false,
    group: 'block structure',
    content: 'block+',
    draggable: false,
    selectable: true,
    isolating: true,
    atom: false,
    editable: rdfaAware,

    attrs: {
      ...rdfaAttrSpec({ rdfaAware }),

      hasTitle: {
        default: false,
      },
      title: {
        default: null,
      },
      number: {
        default: 1,
      },
      startNumber: {
        default: null,
      },
      isOnlyArticle: {
        default: false,
      },
      structureType: {},
      headerTag: {
        default: 'span',
      },
      romanize: {
        default: false,
      },
      headerFormat: {
        default: 'plain-number',
      },

      sayRenderAs: { default: 'structure' },
      fullLengthArticles: { default: config?.fullLengthArticles },
      onlyArticleSpecialName: {
        default:
          config?.onlyArticleSpecialName === undefined
            ? true
            : config?.onlyArticleSpecialName,
      },
    },
    serialize(node: PNode, state: EditorState) {
      const parser = new DOMParser();
      const tag = node.attrs.headerTag;
      const structureType = node.attrs.structureType as StructureType;
      const number = node.attrs.number as number;
      const startNumber = node.attrs.startNumber as number | null;
      const isOnlyArticle = node.attrs.isOnlyArticle as boolean;
      const hasTitle = node.attrs.hasTitle as boolean;
      const titleHTML = hasTitle
        ? parser.parseFromString(node.attrs.title, 'text/html').body
            .firstElementChild
        : null;
      const headerFormat = node.attrs.headerFormat as string;
      const romanizeNumber = node.attrs.romanize as boolean;
      const intlService = getIntlService(state);
      const structureName =
        headerFormat === 'name'
          ? getNameForStructureType(
              structureType,
              number,
              node.attrs.fullLengthArticles,
              intlService,
              state.doc.attrs.lang,
            )
          : null;
      let headerSpec;

      const onlyArticleTitle = intlService
        ? intlService.t('structure-plugin.only-article-title', {
            locale: state.doc.attrs.lang,
          })
        : structureName;
      const displayOnlyArticle =
        isOnlyArticle && node.attrs.onlyArticleSpecialName;
      if (titleHTML) {
        headerSpec = [
          tag,
          { 'data-say-structure-header': true },
          ...(structureName
            ? [
                [
                  'span',
                  { 'data-say-structure-header-name': true },
                  `${displayOnlyArticle ? onlyArticleTitle : structureName} `,
                ],
              ]
            : []),
          [
            'span',
            {
              style: displayOnlyArticle ? 'display: none;' : '',
              'data-say-structure-header-number': true,
              property: ELI('number').full,
              datatype: XSD('string').full,
            },
            getNumberForDisplay(number, romanizeNumber),
          ],
          displayOnlyArticle || headerFormat === 'name' ? ': ' : '. ',
          ['span', { property: EXT('title').full }, titleHTML],
        ];
      } else {
        headerSpec = [
          tag,
          ...(structureName
            ? [
                [
                  'span',
                  { 'data-say-structure-header-name': true },
                  `${displayOnlyArticle ? onlyArticleTitle : structureName} `,
                ],
              ]
            : []),
          [
            'span',
            {
              style: displayOnlyArticle ? 'display: none;' : '',
              'data-say-structure-header-number': true,
              property: ELI('number').full,
              datatype: XSD('string').full,
            },
            getNumberForDisplay(number, romanizeNumber),
          ],
          displayOnlyArticle ? '' : '.',
        ];
      }
      return renderRdfaAware({
        renderable: node,
        tag: 'div',
        attrs: {
          'data-say-render-as': 'structure',
          'data-say-has-title': hasTitle,
          // Should we use the RDFa type instead of a data attribute for this?
          'data-say-structure-type': structureType,
          'data-say-header-format': headerFormat,
          'data-say-header-tag': tag,
          'data-say-number': number,
          'data-say-start-number': startNumber,
          'data-say-romanize': romanizeNumber,
          'data-say-is-only-article': isOnlyArticle,
        },
        content: [
          'div',
          headerSpec,
          [
            'div',
            { property: SAY('body').full, datatype: RDF('XMLLiteral').full },
            0,
          ],
        ],
      });
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          const attrs = getRdfaAttrs(node, { rdfaAware });
          if (
            attrs &&
            attrs.rdfaNodeType === 'resource' &&
            node.dataset.sayRenderAs === 'structure'
          ) {
            const headerFormat = node.dataset.sayHeaderFormat;
            // strict selector here to avoid false positives when structures are nested
            // :scope refers to the element on which we call querySelector
            // say-structure-header-content data attribute is now deprecated in favour of using an
            // RDFa link
            const titleElement = node.querySelector(
              `:scope > div > div > [data-say-structure-header] > [property~='${EXT('title').prefixed}'],
              :scope > div > div > [data-say-structure-header] > [property~='${EXT('title').full}'],
              :scope > div > div > [data-say-structure-header] > [data-say-structure-header-content]`,
            );
            let title: string | undefined = undefined;
            if (titleElement) {
              title = titleElement.innerHTML;
            }
            // Filter out RDFa properties we handle ourselves
            const filteredProperties = attrs.properties.filter(
              (prop) => !ELI('number').matches(prop.predicate),
            );
            return {
              ...attrs,
              properties: filteredProperties,
              hasTitle: parseBooleanDatasetAttribute(node, 'sayHasTitle'),
              structureType: node.dataset.sayStructureType,
              headerFormat,
              headerTag: node.dataset.sayHeaderTag,
              number: Number(node.dataset.sayNumber),
              startNumber:
                node.dataset.sayStartNumber &&
                Number(node.dataset.sayStartNumber),
              romanize: parseBooleanDatasetAttribute(node, 'sayRomanize'),
              isOnlyArticle: parseBooleanDatasetAttribute(
                node,
                'sayIsOnlyArticle',
              ),
              title,
            };
          }
          return false;
        },
        // say-structure-content data attribute is now deprecated in favour of using an RDFa link
        contentElement: `div[data-say-structure-content],
          div[property~='${SAY('body').prefixed}'],
          div[property~='${SAY('body').full}']`,
      },
      // Backwards compatibility with structures created by article-structure-plugin
      // This is relatively complex as each of those nodes was in fact 3 nodes...
      {
        tag: 'div',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          const rdfaAttrs = getRdfaAttrs(node, { rdfaAware });
          const type = rdfaAttrs && getOutgoingTriple(rdfaAttrs, RDF('type'));
          const structConfig =
            type &&
            STRUCTURE_HIERARCHY.find((struct) =>
              struct.rdfType.matches(type.object.value),
            );
          if (!type || !structConfig || rdfaAttrs.rdfaNodeType !== 'resource') {
            return false;
          }

          // Pull attrs out of properties and leave the rest
          let hasTitle = false;
          const filteredProperties = rdfaAttrs.properties.filter((prop) => {
            if (ELI('number').matches(prop.predicate)) return false;
            if (EXT('title').matches(prop.predicate)) {
              hasTitle = true;
              return false;
            }
            // TODO Maybe we need to use these when handling correct RDFa output?
            if (SAY('heading').matches(prop.predicate)) return false;
            if (SAY('body').matches(prop.predicate)) return false;
            return true;
          });

          let headerData:
            | DOMStringMap
            | {
                numberDisplayStyle: string;
                number: string;
                startNumber?: string;
              }
            | false;
          const headerElement = getRdfaContentElement(node).children[0];
          headerData =
            headerElement instanceof HTMLElement && headerElement.dataset;

          let title: Option<string>;
          if (hasTitle) {
            const titleElem = headerElement.querySelector(`
              span[property~='${EXT('title').prefixed}'],
              span[property~='${EXT('title').full}']`);
            title = titleElem && getRdfaContentElement(titleElem)?.textContent;
          }

          if (['paragraph', 'article'].includes(structConfig.structureType)) {
            const numberElement = node.querySelector(`
              span[property~='${ELI('number').prefixed}'],
              span[property~='${ELI('number').full}']`);
            const numberContent =
              numberElement && getRdfaContentElement(numberElement);
            const headerElementData = {
              numberDisplayStyle: 'decimal',
              number: numberContent?.textContent ?? '1',
            };
            if (!headerData || headerElementData.number !== headerData.number) {
              // If we actually successfully managed to get a valid `headerData`, that contains
              // potentially more information, such as startNumber, so use that. If the number
              // doesn't match though, then that headerData is likely just a default one, so
              // ignore it and use our separately parsed one
              headerData = headerElementData;
            }
          }
          if (!headerData) return false;
          const roman = headerData.numberDisplayStyle === 'roman';
          const number =
            headerData.number &&
            (roman ? romanToInt(headerData.number) : Number(headerData.number));
          const startNumber =
            headerData.startNumber && Number(headerData.startNumber);

          return {
            ...rdfaAttrs,
            properties: filteredProperties,
            hasTitle,
            structureType: structConfig.structureType,
            headerFormat: structConfig.headerFormat,
            headerTag: structConfig.headerTag,
            number,
            startNumber,
            // Looking at old data, at least some have the wrong numberDisplayStyle in their data
            // attrs, so while we use the stored value for parsing, we just use the default from the
            // structure configuration
            romanize: structConfig.romanize,
            title,
          };
        },
        contentElement(node) {
          const rdfaContent = getRdfaContentElement(node);
          // Content is actually within the body node
          const body = Array.from(rdfaContent.children).find((child) =>
            SAY('body').matches(child.getAttribute('property') ?? ''),
          );
          return (body && getRdfaContentElement(body)) ?? (node as HTMLElement);
        },
      },
      {
        tag: 'div',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          const rdfaAttrs = getRdfaAttrs(node, { rdfaAware });
          if (
            rdfaAttrs &&
            rdfaAttrs.rdfaNodeType === 'resource' &&
            hasOutgoingNamedNodeTriple(
              rdfaAttrs,
              RDF('type'),
              BESLUIT('Artikel'),
            )
          ) {
            const headerNode = getRdfaContentElement(node).firstElementChild;
            const numberNode = headerNode?.querySelector(
              `span[property~='${ELI('number').prefixed}'],
               span[property~='${ELI('number').full}']`,
            );
            const isOnlyArticle =
              node.dataset.sayIsOnlyArticle &&
              node.dataset.sayIsOnlyArticle !== 'false';
            const number = numberNode?.textContent
              ? parseInt(numberNode.textContent, 10)
              : 1;
            const factory = new SayDataFactory();
            return {
              subject: rdfaAttrs.subject,
              rdfaNodeType: 'resource',
              backlinks: rdfaAttrs.backlinks,
              properties: [
                {
                  predicate: RDF('type').full,
                  object: factory.namedNode(BESLUIT('Artikel').full),
                },
                {
                  predicate: PROV('value').full,
                  object: factory.contentLiteral(),
                },
              ],
              headerTag: 'h5',
              structureType: 'article',
              headerFormat: 'name',
              hasTitle: false,
              isOnlyArticle,
              number,
              romanize: false,
            };
          }
          return false;
        },
        contentElement: (node) => {
          const bodyNode = getRdfaContentElement(node).lastElementChild;
          if (bodyNode) {
            return getRdfaContentElement(bodyNode);
          } else {
            return node as HTMLElement;
          }
        },
      },
    ],
  };
};
export const structure = createEmberNodeSpec(emberNodeConfig());
export const structureView = createEmberNodeView(emberNodeConfig());
export const structureWithConfig = (config?: StructurePluginOptions) =>
  createEmberNodeSpec(emberNodeConfig(config));
export const structureViewWithConfig = (config?: StructurePluginOptions) =>
  createEmberNodeView(emberNodeConfig(config));
