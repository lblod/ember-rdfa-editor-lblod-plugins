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
import SnippetPlaceholderComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/nodes/placeholder';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { getSnippetUriFromId } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { SNIPPET_LIST_RDFA_PREDICATE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';

export function createSnippetPlaceholder(listIds: string[], schema: Schema) {
  const mappingResource = `http://example.net/lblod-snippet-placeholder/${uuidv4()}`;

  return schema.nodes.snippet_placeholder.create({
    rdfaNodeType: 'resource',
    subject: mappingResource,
    properties: [
      {
        predicate: RDF('type').full,
        object: sayDataFactory.namedNode(EXT('SnippetPlaceholder').full),
      },
      ...listIds.map((listId) => ({
        predicate: SNIPPET_LIST_RDFA_PREDICATE.full,
        object: sayDataFactory.namedNode(getSnippetUriFromId(listId)),
      })),
    ],
  });
}

const emberNodeConfig: EmberNodeConfig = {
  name: 'snippet_placeholder',
  inline: false,
  group: 'block',
  atom: true,
  selectable: true,
  editable: true,
  attrs: {
    ...rdfaAttrSpec({ rdfaAware: true }),
    typeof: { default: EXT('SnippetPlaceholder') },
  },
  component: SnippetPlaceholderComponent,
  serialize(node, editorState) {
    const t = getTranslationFunction(editorState);
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-snippet-placeholder',
      },
      content: [
        'text',
        t(
          'snippet-plugin.insert.placeholder',
          'Plaatshouder voor fragment invoegen',
        ),
      ],
    });
  },
  parseDOM: [
    {
      tag: 'div',
      getAttrs(node) {
        if (typeof node === 'string') return false;
        const rdfaAttrs = getRdfaAttrs(node, { rdfaAware: true });
        if (
          hasOutgoingNamedNodeTriple(
            rdfaAttrs,
            RDF('type'),
            EXT('SnippetPlaceholder'),
          )
        ) {
          return rdfaAttrs;
        }
        return false;
      },
    },
  ],
};

export const snippetPlaceholder = createEmberNodeSpec(emberNodeConfig);
export const snippetPlaceholderView = createEmberNodeView(emberNodeConfig);
