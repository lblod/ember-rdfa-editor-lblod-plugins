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
  intl?: IntlService,
  locale?: string,
) {
  if (intl?.exists(`structure-plugin.types.${structureType}`, locale)) {
    return intl?.t(`structure-plugin.types.${structureType}`, { locale });
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

export const emberNodeConfig: () => EmberNodeConfig = () => {
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
      structureType: {},
      displayStructureName: {
        default: false,
      },
      headerTag: {
        default: 'h3',
      },

      sayRenderAs: { default: 'structure' },
    },
    serialize(node: PNode, state: EditorState) {
      const parser = new DOMParser();
      const tag = node.attrs.headerTag;
      const structureType = node.attrs.structureType as StructureType;
      const number = node.attrs.number as number;
      const hasTitle = node.attrs.hasTitle as boolean;
      const titleHTML = hasTitle
        ? parser.parseFromString(node.attrs.title, 'text/html').body
            .firstElementChild
        : null;
      const displayStructureName = node.attrs.displayStructureName as boolean;
      const structureName = displayStructureName
        ? getNameForStructureType(
            structureType,
            getIntlService(state),
            state.doc.attrs.lang,
          )
        : null;
      let headerSpec;

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
            { 'data-say-structure-header-number': true },
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
                  `${structureName} `,
                ],
              ]
            : []),
          [
            'span',
            { 'data-say-structure-header-number': true },
            number.toString(),
          ],
          '.',
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
          if (node.dataset.sayRenderAs === 'structure') {
            const hasTitle =
              node.dataset.sayHasTitle && node.dataset.sayHasTitle !== 'false';
            // strict selector here to avoid false positives when structures are nested
            // :scope refers to the element on which we call querySelector
            const titleElement = node.querySelector(
              ':scope > div > div > [data-say-structure-header] > [data-say-structure-header-content]',
            );
            let title: string | undefined = undefined;
            if (titleElement) {
              title = titleElement.innerHTML;
            }
            return {
              ...attrs,
              hasTitle,
              structureType: node.dataset.sayStructureType,
              displayStructureName: node.dataset.sayDisplayStructureName,
              headerTag: node.dataset.sayHeaderTag,
              number: node.dataset.sayNumber,
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
              ],
              headerTag: 'h5',
              structureType: 'article',
              displayStructureName: true,
              hasTitle: false,
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
