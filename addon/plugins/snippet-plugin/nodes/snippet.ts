import { v4 as uuidv4 } from 'uuid';
import {
  getRdfaAttrs,
  type PNode,
  ProseParser,
  rdfaAttrSpec,
  type SayController,
} from '@lblod/ember-rdfa-editor';
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
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
import {
  findNodesBySubject,
  getBacklinks,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { type OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import SnippetComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/nodes/snippet';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { type SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

// TODO Add 'snippet' link type instead of literal, so can hard-code this to avoid having trouble
// with absolute and prefixed
const forwardDataType = sayDataFactory.namedNode('ex:isforward');
const backwardDataType = sayDataFactory.namedNode('ex:isback');

export function createSnippet({
  controller,
  content,
  title,
  snippetListIds,
  placeholderNode,
}: {
  controller: SayController;
  content: string;
  title: string;
  snippetListIds: string[];
  // importedResources: string[];
  placeholderNode: PNode | null;
}) {
  const rdfaLinks =
    placeholderNode &&
    getBacklinks(placeholderNode)
      ?.filter(
        ({ subject }) =>
          subject.termType === 'LiteralNode' &&
          (forwardDataType.equals(subject.datatype) ||
            backwardDataType.equals(subject.datatype)),
      )
      .flatMap((bl) => {
        const nodesLinkingToSnippet = findNodesBySubject(
          controller.mainEditorState.doc,
          bl.subject.value,
        );
        const linksInToSnippet = nodesLinkingToSnippet.flatMap((node) =>
          (node.value.attrs.properties as OutgoingTriple[])
            .filter(
              ({ object }) =>
                object.termType === 'LiteralNode' &&
                forwardDataType.equals(object.datatype),
            )
            .map((link) => ({
              type: 'forward',
              predicate: link.predicate,
              uri: link.object.value,
            })),
        );
        const linksOutOfSnippet = nodesLinkingToSnippet.flatMap((node) =>
          (node.value.attrs.properties as OutgoingTriple[])
            .filter(
              ({ object }) =>
                object.termType === 'LiteralNode' &&
                backwardDataType.equals(object.datatype),
            )
            .map((link) => ({
              type: 'back',
              predicate: link.predicate,
              uri: link.object.value,
            })),
        );

        return [...linksInToSnippet, ...linksOutOfSnippet];
      });
  console.log({ rdfaLinks });

  // TODO replace instances of linked to uris with the resources that exist in the outer document.
  // Need to make sure to make the links in the right direction

  const parser = ProseParser.fromSchema(controller.schema);

  return controller.schema.node(
    'snippet',
    {
      assignedSnippetListsIds: snippetListIds,
      title,
      subject: `http://data.lblod.info/snippets/${uuidv4()}`,
    },
    htmlToDoc(content, {
      schema: controller.schema,
      parser,
      editorView: controller.mainEditorView,
    }).content,
  );
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
    importedResources: { default: [] },
    title: { default: '' },
    config: { default: options },
  },
  component: SnippetComponent,
  content: 'block+',
  serialize(node) {
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        ...node.attrs,
        'data-assigned-snippet-ids': (
          node.attrs.assignedSnippetListsIds as string[]
        ).join(','),
        'data-imported-resources': (
          node.attrs.importedResources as string[]
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
            importedResources: node
              .getAttribute('data-imported-resources')
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
