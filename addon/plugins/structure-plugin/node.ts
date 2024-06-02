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
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
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
      const html = parser.parseFromString(node.attrs.title, 'text/html');

      return renderRdfaAware({
        renderable: node,
        tag: 'div',
        attrs: { 'data-say-render-as': 'structure' },
        content: [
          'div',
          ['h3', {}, html.body.firstElementChild],
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
            return { ...attrs, title: 'test' };
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
  return schema.node(
    'structure',
    {
      rdfaNodeType: 'resource',
      properties: [
        {
          predicate: RDF('type').full,
          object: { termType: 'NamedNode', value: BESLUIT('Artikel').full },
        },
      ] satisfies OutgoingTriple[],
      hasTitle: false,
      structureName: 'Artikel',
      headerTag: 'h5',
    },
    schema.node('paragraph'),
  );
}
