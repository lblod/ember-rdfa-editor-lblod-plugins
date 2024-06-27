import { v4 as uuidv4 } from 'uuid';
import {
  getRdfaAttrs,
  rdfaAttrSpec,
  type Schema,
} from '@lblod/ember-rdfa-editor';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
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
import { getSnippetUriFromId, SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { SNIPPET_LIST_RDFA_PREDICATE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';

const emberNodeConfig = (options: SnippetPluginConfig): EmberNodeConfig  => ({
  name: 'snippet',
  inline: false,
  atom: false,
  group: 'block',
  selectable: true,
  editable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware: true }),
    typeof: { default: EXT('Snippet') },
    assignedSnippetListsIds: {default: []},
    title: {default: ''},
    config: {default: options},
  },
  component: SnippetComponent,
  content: '(block | title | chapter | article)*',
  serialize(node, editorState) {
    const t = getTranslationFunction(editorState);
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-snippet-placeholder-node',
        'data-assigned-snippet-ids': (node.attrs.assignedSnippetListsIds as string[]).join(','),
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
        console.log(rdfaAttrs)
        if (
          hasOutgoingNamedNodeTriple(
            rdfaAttrs,
            RDF('type'),
            EXT('Snippet'),
          )
        ) {
          return {
            ...rdfaAttrs,
            assignedSnippetListsIds: node.getAttribute('data-assigned-snippet-ids')?.split(','),
            title: node.getAttribute('data-snippet-title'),
          };
        }
        return false;
      },
    },
  ],
});

export const snippet = (config: SnippetPluginConfig) => createEmberNodeSpec(emberNodeConfig(config));
export const snippetView = (config: SnippetPluginConfig) => createEmberNodeView(emberNodeConfig(config));
