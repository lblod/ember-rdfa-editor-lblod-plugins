import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { UnorderedListIcon } from '@appuniversum/ember-appuniversum/components/icons/unordered-list';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { type SayController } from '@lblod/ember-rdfa-editor';
import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import { type OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import SnippetListModal from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list/snippet-list-modal';
import {
  type ImportedResourceMap,
  type SnippetPluginConfig,
  type SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import {
  getAssignedSnippetListsIdsFromProperties,
  getSnippetListIdsProperties,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
import { updateSnippetPlaceholder } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/commands';

interface Signature {
  Args: {
    controller: SayController;
    config: SnippetPluginConfig;
    node: ResolvedPNode;
  };
}

export default class SnippetListSelect extends Component<Signature> {
  @tracked showModal = false;

  @action
  openModal() {
    this.showModal = true;
  }
  @action
  closeModal() {
    this.showModal = false;
  }

  get currentResource() {
    return this.args.node.value.attrs.subject as string | undefined;
  }

  get isResourceNode() {
    return isResourceNode(this.args.node.value);
  }

  get snippetListIdsProperties(): OutgoingTriple[] {
    return getSnippetListIdsProperties(this.args.node.value);
  }

  get assignedSnippetListsIds(): string[] {
    return getAssignedSnippetListsIdsFromProperties(
      this.snippetListIdsProperties,
    );
  }

  get allowMultipleSnippets(): boolean {
    return this.args.node.value.attrs.allowMultipleSnippets as boolean;
  }

  get imported(): ImportedResourceMap {
    return this.args.node.value.attrs['importedResources'];
  }

  @action
  onSaveSnippetLists(lists: SnippetList[], allowMultipleSnippets: boolean) {
    if (this.currentResource) {
      this.args.controller?.doCommand(
        updateSnippetPlaceholder({
          resource: this.currentResource,
          oldSnippetProperties: this.snippetListIdsProperties ?? [],
          newSnippetLists: lists,
          oldImportedResources: this.imported,
          node: this.args.node,
          allowMultipleSnippets,
        }),
        {
          view: this.args.controller.mainEditorView,
        },
      );
    }
  }

  <template>
    {{#if this.isResourceNode}}
      <AuButton
        @icon={{UnorderedListIcon}}
        @skin='secondary'
        @iconAlignment='left'
        {{on 'click' this.openModal}}
      >
        {{t 'snippet-plugin.snippet-list.open-modal'}}
      </AuButton>

      <SnippetListModal
        @config={{@config}}
        @assignedSnippetListsIds={{this.assignedSnippetListsIds}}
        @onSaveSnippetLists={{this.onSaveSnippetLists}}
        @allowMultipleSnippets={{this.allowMultipleSnippets}}
        @open={{this.showModal}}
        @closeModal={{this.closeModal}}
      />
    {{/if}}
  </template>
}
