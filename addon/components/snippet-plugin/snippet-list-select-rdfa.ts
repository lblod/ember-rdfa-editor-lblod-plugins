import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/utils/_private/types';

import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/addon/core/rdfa-processor';

import SayController from '@lblod/ember-rdfa-editor/addon/core/say-controller';

import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import {
  getAssignedSnippetListsIdsFromProperties,
  getSnippetListIdsProperties,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
import { updateSnippetIds } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/commands';

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
