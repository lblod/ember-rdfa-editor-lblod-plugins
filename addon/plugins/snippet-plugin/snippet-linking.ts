import { PNode, ProsePlugin } from '@lblod/ember-rdfa-editor';
import { snippetRdfaPluginKey } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

// We define this plugin here but it's used in the editor repo.
export const placeholderPlugin = new ProsePlugin({
  key: snippetRdfaPluginKey,
  // The state of the plugin is used when editing snippets, to provide the relevant context for the
  // snippet document
  state: {
    init(_config, instance) {
      const imported = instance.doc.attrs['data-say-imports'];
      if (imported) {
        // FIXME error handling
        const resources = JSON.parse(imported);
        return { imported: resources };
      }
      return {};
    },
    apply(_tr, value, _oldState, _newState) {
      return value;
    },
  },
  /** A function to pull out the imported resources used in a snippet placeholder */
  extractImportedResources: (node: PNode) => {
    if (
      hasOutgoingNamedNodeTriple(
        node.attrs,
        RDF('type'),
        EXT('SnippetPlaceholder'),
      )
    ) {
      return node.attrs.importedResources;
    }
  },
});
