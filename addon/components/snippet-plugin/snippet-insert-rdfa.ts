import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import Component from '@glimmer/component';

import { SayController } from '@lblod/ember-rdfa-editor';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/utils/_private/types';
import { AttributeProperty } from '@lblod/ember-rdfa-editor/addon/core/rdfa-processor';
import { findParentNodeClosestToPos } from '@curvenote/prosemirror-utils';
import {
  getAssignedSnippetListsIdsFromProperties,
  getSnippetListIdsProperties,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';

interface Args {
  controller: SayController;
  config: SnippetPluginConfig;
  node: ResolvedPNode;
}

export default class SnippetInsertRdfaComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get config() {
    return this.args.config;
  }

  get node() {
    return this.args.node;
  }

  get showInsert() {
    return this.assignedSnippetListsIds.length > 0;
  }

  get snippetListIdsProperty(): AttributeProperty[] | undefined {
    const activeNode = this.node.value;
    const activeNodeSnippetListIds = getSnippetListIdsProperties(activeNode);

    if (activeNodeSnippetListIds && activeNodeSnippetListIds.length > 0) {
      return activeNodeSnippetListIds;
    }

    const doc = this.controller.mainEditorState.doc;

    if (this.node.pos < 0) {
      return undefined;
    }

    const pos = doc.resolve(this.node.pos);

    let parentNode = findParentNodeClosestToPos(pos, (node) =>
      isResourceNode(node),
    );

    while (parentNode) {
      const properties = getSnippetListIdsProperties(parentNode.node);

      if (properties) {
        return properties;
      }

      parentNode = findParentNodeClosestToPos(
        doc.resolve(parentNode.pos),
        (node) => isResourceNode(node),
      );
    }

    return undefined;
  }

  get assignedSnippetListsIds(): string[] {
    return getAssignedSnippetListsIdsFromProperties(
      this.snippetListIdsProperty,
    );
  }
}
