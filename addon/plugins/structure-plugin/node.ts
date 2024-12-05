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
const rdfaAware = true;

export function getNameForStructureType(
  structureType: StructureType,
  number: number,
  fullLenghtArticles?: boolean,
  intl?: IntlService,
  locale?: string,
) {
  if (intl?.exists(`structure-plugin.types.${structureType}`, locale)) {
    if (structureType === 'article' && number !== 1 && !fullLenghtArticles) {
      return intl?.t(`structure-plugin.shortened-article`, { locale });
    } else {
      return intl?.t(`structure-plugin.types.${structureType}`, { locale });
    }
  } else {
    return structureType;
  }
}

export type StructureType =
  | 'article'
  | 'chapter'
  | 'section'
  | 'subsection'
  | 'paragraph';

type StructureConfig = {
  fullLenghtArticles: boolean;
  onlyArticleSpecialName: boolean;
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
      isOnlyArticle: {
        default: false,
      },
      structureType: {},
      displayStructureName: {
        default: false,
      },
      headerTag: {
        default: 'h3',
      },

      sayRenderAs: { default: 'structure' },
      fullLenghtArticles: { default: config?.fullLenghtArticles },
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
      const isOnlyArticle = node.attrs.isOnlyArticle as boolean;
      const hasTitle = node.attrs.hasTitle as boolean;
      const titleHTML = hasTitle
        ? parser.parseFromString(node.attrs.title, 'text/html').body
            .firstElementChild
        : null;
      const displayStructureName = node.attrs.displayStructureName as boolean;
      const intlService = getIntlService(state);
      const structureName = displayStructureName
        ? getNameForStructureType(
            structureType,
            number,
            node.attrs.fullLenghtArticles,
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
                  `${structureName} `,
                ],
              ]
            : []),
          [
            'span',
            {
              'data-say-structure-header-number': true,
              property: ELI('number').full,
            },
            number.toString(),
          ],
          '. ',
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
            },
            number.toString(),
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
          'data-say-structure-type': structureType,
          'data-say-display-structure-name': displayStructureName,
          'data-say-header-tag': tag,
          'data-say-number': number,
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
            const hasTitle =
              node.dataset.sayHasTitle && node.dataset.sayHasTitle !== 'false';
            const isOnlyArticle =
              node.dataset.sayIsOnlyArticle &&
              node.dataset.sayIsOnlyArticle !== 'false';
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
              hasTitle,
              structureType: node.dataset.sayStructureType,
              displayStructureName: node.dataset.sayDisplayStructureName,
              headerTag: node.dataset.sayHeaderTag,
              number: Number(node.dataset.sayNumber),
              isOnlyArticle,
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
              displayStructureName: true,
              hasTitle: false,
              isOnlyArticle,
              number,
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
