import type { ComponentLike } from '@glint/template';
import {
  PNode,
  Schema,
  getRdfaAttrs,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import Structure from '@lblod/ember-rdfa-editor-lblod-plugins/components/structure-plugin/_private/structure';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { v4 as uuid } from 'uuid';
const rdfaAware = true;

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
      structureName: {
        default: 'Structure',
      },
      headerTag: {
        default: 'h3',
      },

      sayRenderAs: { default: 'structure' },
    },
    serialize(node: PNode) {
      const parser = new DOMParser();
      const tag = node.attrs.headerTag;
      const structureName = node.attrs.structureName;
      const number = node.attrs.number;

      let headerSpec;
      if (node.attrs.hasTitle) {
        const html = parser.parseFromString(node.attrs.title, 'text/html');
        if (html.body.firstElementChild) {
          headerSpec = [
            tag,
            { 'data-say-structure-header': true },
            [
              'span',
              { 'data-say-structure-header-name': true },
              `${structureName} `,
            ],
            ['span', { 'data-say-structure-header-number': true }, number],
            [
              'span',
              { 'data-say-structure-header-content': true },
              html.body.firstElementChild,
            ],
          ];
        } else {
          headerSpec = [
            tag,
            [
              'span',
              { 'data-say-structure-header-name': true },
              `${structureName} `,
            ],
            ['span', { 'data-say-structure-header-number': true }, number],
          ];
        }
      } else {
        headerSpec = [
          tag,
          [
            'span',
            { 'data-say-structure-header-name': true },
            `${structureName} `,
          ],
          ['span', { 'data-say-structure-header-number': true }, number],
        ];
      }

      return renderRdfaAware({
        renderable: node,
        tag: 'div',
        attrs: {
          'data-say-render-as': 'structure',
          'data-say-has-title': node.attrs.hasTitle,
          'data-say-structure-name': node.attrs.structureName,
          'data-say-header-tag': node.attrs.headerTag,
          'data-say-number': node.attrs.number,
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
              structureName: node.dataset.sayStructureName,
              headerTag: node.dataset.sayHeaderTag,
              number: node.dataset.sayNumber,
              title,
            };
          }
          return false;
        },
        contentElement: `div[data-say-structure-content]`,
      },
    ],
  };
};
export const structure = createEmberNodeSpec(emberNodeConfig());
export const structureView = createEmberNodeView(emberNodeConfig());
export function buildArticleStructure(schema: Schema) {
  const articleId = uuid();
  const articleResource = `http://data.lblod.info/artikels/--ref-uuid4-${articleId}`;
  const factory = new SayDataFactory();
  return schema.node(
    'structure',
    {
      rdfaNodeType: 'resource',
      properties: [
        {
          predicate: RDF('type').full,
          object: factory.namedNode(BESLUIT('Artikel').full),
        },
      ] satisfies OutgoingTriple[],
      hasTitle: true,
      title: '',
      structureName: 'Artikel',
      headerTag: 'h5',
      subject: articleResource,
    },
    schema.node('paragraph'),
  );
}
