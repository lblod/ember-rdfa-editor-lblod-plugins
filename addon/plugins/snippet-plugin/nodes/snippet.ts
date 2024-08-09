import { v4 as uuidv4 } from 'uuid';
import {
  getRdfaAttrs,
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
import SnippetComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/nodes/snippet';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { jsonParse } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import {
  type ImportedResourceMap,
  type SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

export function createSnippet({
  controller,
  content,
  title,
  snippetListIds,
  importedResources,
}: {
  controller: SayController;
  content: string;
  title: string;
  snippetListIds: string[];
  importedResources: ImportedResourceMap;
}) {
  // Replace instances of linked to uris with the resources that exist in the outer document.
  let replacedContent = content;
  for (const imported in importedResources) {
    const linked = importedResources[imported];
    if (linked) {
      replacedContent = replacedContent.replaceAll(imported, linked);
    }
  }
  const parser = ProseParser.fromSchema(controller.schema);

  return controller.schema.node(
    'snippet',
    {
      assignedSnippetListsIds: snippetListIds,
      title,
      subject: `http://data.lblod.info/snippets/${uuidv4()}`,
      importedResources,
    },
    htmlToDoc(replacedContent, {
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
    importedResources: { default: {} },
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
