import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import Component from '@glimmer/component';

import { SayController } from '@lblod/ember-rdfa-editor';
import {
  type SnippetListProperties,
  type SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { findParentNodeClosestToPos } from '@curvenote/prosemirror-utils';
import {
  getAssignedSnippetListsIdsFromProperties,
  getSnippetListIdsProperties,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
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
  get disableInsert() {
    return (this.snippetListProperties?.listIds.length ?? 0) === 0;
  }

  get snippetListProperties(): SnippetListProperties | undefined {
    const activeNode = this.args.node.value;
    const activeNodeSnippetListIds = getSnippetListIdsProperties(activeNode);

    if (activeNodeSnippetListIds.length > 0) {
      return {
        listIds: getAssignedSnippetListsIdsFromProperties(
          activeNodeSnippetListIds,
        ),
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
      const properties = getSnippetListIdsProperties(parentNode.node);

      if (properties.length > 0) {
        return {
          listIds: getAssignedSnippetListsIdsFromProperties(properties),
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
      @snippetListProperties={{this.snippetListProperties}}
      @disabled={{this.disableInsert}}
      @allowMultipleSnippets={{this.allowMultipleSnippets}}
    />
  </template>
}
