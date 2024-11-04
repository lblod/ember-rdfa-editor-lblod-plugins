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
import { jsonParse } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import {
  getSnippetUriFromId,
  type ImportedResourceMap,
  type SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { SNIPPET_LIST_RDFA_PREDICATE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';

export function importedResourcesFromSnippetLists(
  lists: SnippetList[],
  existing: ImportedResourceMap = {},
) {
  return Object.fromEntries<ImportedResourceMap[string]>(
    lists
      .flatMap((list) => list.importedResources)
      // Null is important (in place of undefined) in order to keep the unlinked entries
      .map((res) => [res, existing[res] ?? null]),
  );
}

export function createSnippetPlaceholder(
  lists: SnippetList[],
  schema: Schema,
  allowMultipleSnippets?: boolean,
) {
  const mappingResource = `http://example.net/lblod-snippet-placeholder/${uuidv4()}`;
  return schema.nodes.snippet_placeholder.create({
    rdfaNodeType: 'resource',
    snippetListNames: lists.map((list) => list.label),
    subject: mappingResource,
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
    importedResources: importedResourcesFromSnippetLists(lists),
    allowMultipleSnippets,
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
    snippetListNames: { default: [] },
    importedResources: { default: {} },
    allowMultipleSnippets: { default: false },
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
        'data-list-names': (node.attrs.snippetListNames as string[])?.join(','),
        'data-imported-resources': JSON.stringify(node.attrs.importedResources),
        'data-allow-multiple-snippets': node.attrs.allowMultipleSnippets,
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
            snippetListNames: node.getAttribute('data-list-names')?.split(','),
            importedResources: jsonParse(
              node.getAttribute('data-imported-resources'),
            ),
            allowMultipleSnippets:
              node.dataset.allowMultipleSnippets === 'true',
          };
        }
        return false;
      },
    },
  ],
};

export const snippetPlaceholder = createEmberNodeSpec(emberNodeConfig);
export const snippetPlaceholderView = createEmberNodeView(emberNodeConfig);
