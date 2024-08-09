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
import { jsonParse } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import {
  getSnippetUriFromId,
  type ImportedResourceMap,
  type SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { SNIPPET_LIST_RDFA_PREDICATE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';

export function createSnippetPlaceholder(lists: SnippetList[], schema: Schema) {
  const importedResources = Object.fromEntries<ImportedResourceMap[string]>(
    lists.flatMap((list) => list.importedResources).map((res) => [res, null]),
  );

  return schema.nodes.snippet_placeholder.create({
    rdfaNodeType: 'resource',
    listNames: lists.map((list) => list.label),
    properties: [
      {
        predicate: RDF('type').full,
        object: sayDataFactory.namedNode(EXT('SnippetPlaceholder').full),
      },
      ...lists.map((list) => ({
        predicate: SNIPPET_LIST_RDFA_PREDICATE.full,
        object: sayDataFactory.namedNode(getSnippetUriFromId(list.id)),
      })),
    ],
    importedResources,
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
    listNames: { default: [] },
    importedResources: { default: {} },
  },
  component: SnippetPlaceholderComponent,
  serialize(node, editorState) {
    const t = getTranslationFunction(editorState);
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        class: 'say-snippet-placeholder-node',
        'data-list-names': (node.attrs.listNames as string[]).join(','),
        'data-imported-resources': JSON.stringify(node.attrs.importedResources),
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
          return {
            ...rdfaAttrs,
            listNames: node.getAttribute('data-list-names')?.split(','),
            importedResources: jsonParse(
              node.getAttribute('data-imported-resources'),
            ),
          };
        }
        return false;
      },
    },
  ],
};

export const snippetPlaceholder = createEmberNodeSpec(emberNodeConfig);
export const snippetPlaceholderView = createEmberNodeView(emberNodeConfig);
