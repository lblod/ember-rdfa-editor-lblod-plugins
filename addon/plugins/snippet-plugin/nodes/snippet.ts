import { v4 as uuidv4 } from 'uuid';
import templateUuidInstantiator from '@lblod/template-uuid-instantiator';
import {
  type Attrs,
  getRdfaAttrs,
  type PNode,
  ProseParser,
  rdfaAttrSpec,
  type Schema,
} from '@lblod/ember-rdfa-editor';
import {
  renderRdfaAware,
  getRdfaContentElement,
} from '@lblod/ember-rdfa-editor/core/schema';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  type IncomingTriple,
  type OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  type EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
import SnippetComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/nodes/snippet';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { jsonParse } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import {
  DEFAULT_CONTENT_STRING,
  SnippetListProperties,
  type SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import {
  tripleForSnippetListUri,
  tripleForSnippetListId,
} from '../utils/rdfa-predicate';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

function outgoingFromBacklink(
  backlink: IncomingTriple,
  attrs: Attrs,
): OutgoingTriple {
  if (attrs.rdfaNodeType === 'resource') {
    return {
      predicate: backlink.predicate,
      object: sayDataFactory.resourceNode(attrs.subject),
    };
  } else {
    return {
      predicate: backlink.predicate,
      object: sayDataFactory.literalNode(attrs.__rdfaId),
    };
  }
}

const defaultProperties = [
  {
    predicate: RDF('type').full,
    object: sayDataFactory.namedNode(EXT('Snippet').full),
  },
];

interface CreateSnippetArgs {
  schema: Schema;
  allowMultipleSnippets?: boolean;
  content: string;
  title: string;
  listProperties: SnippetListProperties;
}

/**
 * Creates a Snippet node wrapping the given content while allowing for further snippets to be added
 * or removed. Takes care of linking imported resources.
 * @returns a tuple containing the Node and the map of imported resources to the new outgoing
 * properties that these resources will have after the snippet is inserted into the document.
 **/
export function createSnippet({
  schema,
  content,
  title,
  allowMultipleSnippets,
  listProperties: {
    listUris,
    names: snippetListNames,
    importedResources,
    placeholderId,
  },
}: CreateSnippetArgs): [PNode, Map<string, OutgoingTriple[]>] {
  // Replace instances of linked to uris with the resources that exist in the outer document.
  let replacedContent = content;
  for (const imported in importedResources) {
    const linked = importedResources[imported];
    if (linked) {
      replacedContent = replacedContent.replaceAll(imported, linked);
    }
  }
  // Instantiate URIs of the form --ref-algo-123
  replacedContent = templateUuidInstantiator(replacedContent);
  // Create the new node
  const parser = ProseParser.fromSchema(schema);
  const contentAsNode = htmlToDoc(replacedContent, {
    schema,
    parser,
  });
  const properties = [
    ...defaultProperties,
    ...listUris.map(tripleForSnippetListUri),
  ];
  const node = schema.node(
    'snippet',
    {
      placeholderId,
      properties,
      snippetListNames,
      title,
      subject: `http://data.lblod.info/snippets/${uuidv4()}`,
      importedResources,
      allowMultipleSnippets,
    },
    contentAsNode.content,
  );
  // Find all the new backlinks that refer to imported resources and generate OutgoingLinks for them
  const importedTriples: Map<string, OutgoingTriple[]> = new Map();
  if (Object.keys(importedResources ?? {}).length > 0) {
    contentAsNode.descendants((descendantNode) => {
      const backlinks = descendantNode.attrs.backlinks as
        | IncomingTriple[]
        | undefined;
      if (backlinks && backlinks.length > 0) {
        for (const imported in importedResources) {
          const linked = importedResources[imported];
          if (linked) {
            const backlink = backlinks.find(
              (bl) => bl.subject.value === linked,
            );
            if (backlink) {
              const collectedLinks = importedTriples.get(linked) || [];
              collectedLinks.push(
                outgoingFromBacklink(backlink, descendantNode.attrs),
              );
              importedTriples.set(linked, collectedLinks);
            }
          }
        }
      }
    });
  }

  return [node, importedTriples];
}

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
      default: defaultProperties,
    },
    rdfaNodeType: { default: 'resource' },
    placeholderId: { default: '' },
    snippetListNames: { default: [] },
    importedResources: { default: {} },
    title: { default: '' },
    config: { default: options },
    allowMultipleSnippets: { default: false },
  },
  component: SnippetComponent,
  content: options.allowedContent || DEFAULT_CONTENT_STRING,
  classNames: ['say-snippet'],
  serialize(node) {
    const listNames = node.attrs.snippetListNames as string[];
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        'data-snippet-placeholder-id': node.attrs.placeholderId,
        'data-list-names': listNames && JSON.stringify(listNames),
        'data-imported-resources': JSON.stringify(node.attrs.importedResources),
        'data-snippet-title': node.attrs.title,
        'data-allow-multiple-snippets': node.attrs.allowMultipleSnippets,
        class: getClassnamesFromNode(node),
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
          rdfaAttrs &&
          rdfaAttrs.rdfaNodeType !== 'literal' &&
          hasOutgoingNamedNodeTriple(rdfaAttrs, RDF('type'), EXT('Snippet'))
        ) {
          // For older documents without placeholder ids, treat each inserted snippet separately.
          // This means that pressing 'remove snippet' will add a placeholder in it's place, which
          // is not expected, but simple to remove (hitting backspace). This is better than
          // risking having no ability to insert another snippet.
          const placeholderId =
            node.getAttribute('data-snippet-placeholder-id') || uuidv4();
          const legacySnippetListIds = node
            .getAttribute('data-assigned-snippet-ids')
            ?.split(',');
          const properties = !legacySnippetListIds
            ? rdfaAttrs.properties
            : [
                ...rdfaAttrs.properties,
                ...legacySnippetListIds.map(tripleForSnippetListId),
              ];
          return {
            ...rdfaAttrs,
            properties,
            placeholderId,
            snippetListNames: jsonParse(node.getAttribute('data-list-names')),
            importedResources: jsonParse(
              node.getAttribute('data-imported-resources'),
            ),
            title: node.getAttribute('data-snippet-title'),
            allowMultipleSnippets:
              node.dataset.allowMultipleSnippets === 'true',
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
