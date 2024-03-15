import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';

import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import {
  getAssignedSnippetListsIdsFromProperties,
  getSnippetListIdsProperties,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
import { updateSnippetIds } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/commands';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { SayController } from '@lblod/ember-rdfa-editor';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

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
    return this.node.value.attrs.subject as string | undefined;
  }

  get isResourceNode() {
    return isResourceNode(this.node.value);
  }

  get snippetListIdsProperties(): OutgoingTriple[] {
    return getSnippetListIdsProperties(this.node.value);
  }

  get assignedSnippetListsIds(): string[] {
    return getAssignedSnippetListsIdsFromProperties(
      this.snippetListIdsProperties,
    );
  }

  saveChanges = task(async (snippetIds: string[]) => {
    if (this.currentResource) {
      this.args.controller?.doCommand(
        updateSnippetIds({
          resource: this.currentResource,
          oldSnippetProperties: this.snippetListIdsProperties ?? [],
          newSnippetIds: snippetIds,
        }),
        {
          view: this.args.controller.mainEditorView,
        },
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
