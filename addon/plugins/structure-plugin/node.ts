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
  PROV,
  RDF,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
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
import { romanize } from '../article-structure-plugin/utils/romanize';
import { StructureType } from './structure-types';
import { parseBooleanDatasetAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/dom-utils';

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

type StructureConfig = {
  fullLengthArticles?: boolean;
  onlyArticleSpecialName?: boolean;
};

export const emberNodeConfig: (config?: StructureConfig) => EmberNodeConfig = (
  config,
) => {
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
        default: true,
      },
      title: {
        default: 'title',
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
          ['span', { 'data-say-structure-header-content': true }, titleHTML],
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
          ['div', { 'data-say-structure-content': true }, 0],
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
            const titleElement = node.querySelector(
              ':scope > div > div > [data-say-structure-header] > [data-say-structure-header-content]',
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
        contentElement: `div[data-say-structure-content]`,
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
export const structureWithConfig = (config?: StructureConfig) =>
  createEmberNodeSpec(emberNodeConfig(config));
export const structureViewWithConfig = (config?: StructureConfig) =>
  createEmberNodeView(emberNodeConfig(config));
