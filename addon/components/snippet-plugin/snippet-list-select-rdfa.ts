import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/utils/_private/types';

import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { AttributeProperty } from '@lblod/ember-rdfa-editor/addon/core/rdfa-processor';

import SayController from '@lblod/ember-rdfa-editor/addon/core/say-controller';

import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import {
  getAssignedSnippetListsIdsFromProperty,
  getSnippetListIdsProperty,
  SNIPPET_LIST_RDFA_PREDICATE,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';

interface Args {
  controller: SayController;
  config: SnippetPluginConfig;
  node: ResolvedPNode;
}

export default class SnippetListSelectRdfaComponent extends Component<Args> {
  get config() {
    return this.args.config;
  }

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  get currentResource() {
    return this.node.value.attrs.resource as string | undefined;
  }

  get isResourceNode() {
    return isResourceNode(this.node.value);
  }

  get snippetListIdsProperty(): AttributeProperty | undefined {
    return getSnippetListIdsProperty(this.node.value);
  }

  get assignedSnippetListsIds(): string[] {
    return getAssignedSnippetListsIdsFromProperty(this.snippetListIdsProperty);
  }

  saveChanges = task(async (snippetIds) => {
    // TODO: Implement `updateProperty` in editor repo, maybe?
    // Consider edge cases - e.g. what part of the property should we allow to update?
    // Can we update the predicate? Can we update the object? Can we update the type?
    // Seems like `removing` -> `adding` the property avoids a lot of edge cases.
    if (this.currentResource) {
      if (this.snippetListIdsProperty) {
        this.args.controller?.doCommand(
          removeProperty({
            resource: this.currentResource,
            property: this.snippetListIdsProperty,
          }),
          { view: this.args.controller.mainEditorView },
        );
      }

      this.args.controller?.doCommand(
        addProperty({
          resource: this.currentResource,
          property: {
            type: 'attribute',
            predicate: SNIPPET_LIST_RDFA_PREDICATE,
            object: JSON.stringify(snippetIds),
          },
        }),
        { view: this.args.controller.mainEditorView },
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
