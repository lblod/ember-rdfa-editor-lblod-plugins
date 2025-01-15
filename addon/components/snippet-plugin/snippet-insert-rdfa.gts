import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import Component from '@glimmer/component';

import { SayController } from '@lblod/ember-rdfa-editor';
import {
  type SnippetListProperties,
  type SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { findParentNodeClosestToPos } from '@curvenote/prosemirror-utils';
import { getSnippetListUrisFromNode } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import SnippetInsert from './snippet-insert';

interface Sig {
  Args: {
    controller: SayController;
    config: SnippetPluginConfig;
    node: ResolvedPNode;
  };
}

export default class SnippetInsertRdfaComponent extends Component<Sig> {
  get listProperties(): SnippetListProperties | undefined {
    const activeNode = this.args.node.value;
    const listUris = getSnippetListUrisFromNode(activeNode);

    if (listUris.length > 0) {
      return {
        listUris,
        placeholderId: activeNode.attrs.placeholderId,
        names: activeNode.attrs.snippetListNames,
        importedResources: activeNode.attrs.importedResources,
      };
    }

    if (this.args.node.pos < 0) {
      return undefined;
    }

    // If active node isn't a snippet list, go up until we find one
    const doc = this.args.controller.mainEditorState.doc;
    const pos = doc.resolve(this.args.node.pos);
    let parentNode = findParentNodeClosestToPos(pos, (node) =>
      isResourceNode(node),
    );
    while (parentNode) {
      const listUris = getSnippetListUrisFromNode(parentNode.node);

      if (listUris.length > 0) {
        return {
          listUris,
          placeholderId: parentNode.node.attrs.placeholderId,
          names: parentNode.node.attrs.snippetListNames,
          importedResources: parentNode.node.attrs.importedResources,
        };
      }

      parentNode = findParentNodeClosestToPos(
        doc.resolve(parentNode.pos),
        (node) => isResourceNode(node),
      );
    }

    return undefined;
  }

  get allowMultipleSnippets() {
    return this.args.node.value.attrs.allowMultipleSnippets as boolean;
  }

  <template>
    <SnippetInsert
      @config={{@config}}
      @controller={{@controller}}
      @listProperties={{this.listProperties}}
      @allowMultipleSnippets={{this.allowMultipleSnippets}}
    />
  </template>
}
