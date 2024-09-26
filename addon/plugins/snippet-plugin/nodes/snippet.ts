import { v4 as uuidv4 } from 'uuid';
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
  type ImportedResourceMap,
  type SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

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
      object: sayDataFactory.literalNode(
        attrs.__rdfaId,
        ('language' in backlink.subject && backlink.subject.language) ||
          ('datatype' in backlink.subject && backlink.subject.datatype) ||
          '',
      ),
    };
  }
}

interface CreateSnippetArgs {
  schema: Schema;
  content: string;
  title: string;
  snippetListIds: string[];
  importedResources?: ImportedResourceMap;
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
  snippetListIds,
  importedResources,
}: CreateSnippetArgs): [PNode, Map<string, OutgoingTriple[]>] {
  // Replace instances of linked to uris with the resources that exist in the outer document.
  let replacedContent = content;
  for (const imported in importedResources) {
    const linked = importedResources[imported];
    if (linked) {
      replacedContent = replacedContent.replaceAll(imported, linked);
    }
  }
  // Create the new node
  const parser = ProseParser.fromSchema(schema);
  const contentAsNode = htmlToDoc(replacedContent, {
    schema,
    parser,
  });
  const node = schema.node(
    'snippet',
    {
      assignedSnippetListsIds: snippetListIds,
      title,
      subject: `http://data.lblod.info/snippets/${uuidv4()}`,
      importedResources,
    },
    contentAsNode.content,
  );
  // Find all the new backlinks that refer to imported resources and generate OutgoingLinks for them
  const importedTriples: Map<string, OutgoingTriple[]> = new Map();
  if (Object.keys(importedResources ?? {}).length > 0) {
    contentAsNode.descendants((node) => {
      const backlinks = node.attrs.backlinks as IncomingTriple[] | undefined;
      if (backlinks && backlinks.length > 0) {
        for (const imported in importedResources) {
          const linked = importedResources[imported];
          if (linked) {
            const backlink = backlinks.find(
              (bl) => bl.subject.value === linked,
            );
            if (backlink) {
              const collectedLinks = importedTriples.get(linked) || [];
              collectedLinks.push(outgoingFromBacklink(backlink, node.attrs));
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
      default: [
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(EXT('Snippet').full),
        },
      ],
    },
    rdfaNodeType: { default: 'resource' },
    assignedSnippetListsIds: { default: [] },
    importedResources: { default: {} },
    title: { default: '' },
    config: { default: options },
  },
  component: SnippetComponent,
  content: options.allowedContent || DEFAULT_CONTENT_STRING,
  serialize(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        'data-assigned-snippet-ids': (
          node.attrs.assignedSnippetListsIds as string[]
        ).join(','),
        'data-imported-resources': JSON.stringify(node.attrs.importedResources),
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
            importedResources: jsonParse(
              node.getAttribute('data-imported-resources'),
            ),
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
