import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import {
  renderRdfaAware,
  getRdfaContentElement,
} from '@lblod/ember-rdfa-editor/core/schema';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  type EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import SnippetComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/nodes/snippet';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

const emberNodeConfig = (options: SnippetPluginConfig): EmberNodeConfig => ({
  name: 'snippet',
  inline: false,
  atom: false,
  group: 'block',
  selectable: true,
  editable: true,
  isolating: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware: true }),
    properties: {
      default: [
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(EXT('Snippet').full),
        },
      ],
    },
    rdfaNodeType: { default: 'resource' },
    assignedSnippetListsIds: { default: [] },
    title: { default: '' },
    config: { default: options },
  },
  component: SnippetComponent,
  content: '(block | title | chapter | article)*',
  serialize(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-snippet-placeholder-node',
        'data-assigned-snippet-ids': (
          node.attrs.assignedSnippetListsIds as string[]
        ).join(','),
        'data-snippet-title': node.attrs.title,
      },
      content: 0,
    });
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(node) {
        if (typeof node === 'string') return false;
        const rdfaAttrs = getRdfaAttrs(node, { rdfaAware: true });
        if (
          hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), EXT('Snippet'))
        ) {
          return {
            ...rdfaAttrs,
            assignedSnippetListsIds: node
              .getAttribute('data-assigned-snippet-ids')
              ?.split(','),
            title: node.getAttribute('data-snippet-title'),
          };
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
  ],
});

export const snippet = (config: SnippetPluginConfig) =>
  createEmberNodeSpec(emberNodeConfig(config));
export const snippetView = (config: SnippetPluginConfig) =>
  createEmberNodeView(emberNodeConfig(config));
