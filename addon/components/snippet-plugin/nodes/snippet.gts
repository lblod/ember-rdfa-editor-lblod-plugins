import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import SearchModal from '../search-modal';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { SynchronizeIcon } from '@appuniversum/ember-appuniversum/components/icons/synchronize';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { type EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import {
  type PNode,
  ProseParser,
  type Selection,
  Slice,
} from '@lblod/ember-rdfa-editor';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import insertSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/commands/insert-snippet';
import { isNone } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { recalculateNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/recalculate-structure-numbers';

interface Signature {
  Args: EmberNodeArgs;
  Blocks: {
    default: [];
  };
}

export default class SnippetNode extends Component<Signature> {
  @tracked showModal: boolean = false;
  @tracked mode: string = '';
  get controller() {
    return this.args.controller;
  }
  get node() {
    return this.args.node;
  }
  @action
  closeModal() {
    this.showModal = false;
  }
  openModal() {
    this.showModal = true;
  }
  @action
  addFragment() {
    this.mode = 'add';
    this.openModal();
  }
  @action
  editFragment() {
    this.mode = 'edit';
    this.openModal();
  }
  @action
  deleteFragment() {
    const position = this.args.getPos();
    if (position !== undefined) {
      this.controller.withTransaction((tr) => {
        return transactionCombinator(
          this.controller.mainEditorState,
          tr.deleteRange(position, position + this.node.nodeSize),
        )([recalculateNumbers]).transaction;
      });
    }
  }
  createSliceFromElement(element: Element) {
    return new Slice(
      ProseParser.fromSchema(this.controller.schema).parse(element, {
        preserveWhitespace: true,
      }).content,
      0,
      0,
    );
  }
  get selection(): Selection {
    return this.controller.mainEditorState.selection;
  }
  get isActive(): boolean {
    const ancestor = findAncestors(this.selection.$from, (node: PNode) => {
      return hasOutgoingNamedNodeTriple(
        node.attrs,
        RDF('type'),
        EXT('Snippet'),
      );
    })[0];
    return ancestor && ancestor.node === this.node;
  }
  @action
  onInsert(content: string, title: string) {
    this.closeModal();
    const assignedSnippetListsIds = this.node.attrs.assignedSnippetListsIds;
    let start = 0;
    let end = 0;
    const pos = this.args.getPos();
    if (isNone(pos)) {
      return;
    }
    if (this.mode === 'add') {
      // Add new snippet
      start = pos + this.node.nodeSize;
      end = pos + this.node.nodeSize;
    } else {
      //Replace current snippet
      start = pos;
      end = pos + this.node.nodeSize;
    }
    this.controller.doCommand(
      insertSnippet({
        content,
        title,
        assignedSnippetListsIds,
        importedResources: this.node.attrs.importedResources,
        range: { start, end },
      }),
    );
  }
  <template>
    <div class='say-snippet-card'>
      <div class='say-snippet-title'>{{this.node.attrs.title}}</div>
      <div class='say-snippet-content'>{{yield}}</div>
      {{#if this.isActive}}
        <div class='say-snippet-icons'>
          <button
            class='say-snippet-button'
            type='button'
            {{on 'click' this.editFragment}}
          >
            <AuIcon @icon={{SynchronizeIcon}} @size='large' />
            <div class='say-snippet-button-text'>
              {{t 'snippet-plugin.snippet-node.change-fragment'}}
            </div>
          </button>
          <button
            class='say-snippet-button say-snippet-remove-button'
            type='button'
            {{on 'click' this.deleteFragment}}
          >
            <AuIcon @icon={{BinIcon}} />
            <div class='say-snippet-button-text'>
              {{t 'snippet-plugin.snippet-node.remove-fragment'}}
            </div>
          </button>
          <button
            class='say-snippet-button'
            type='button'
            {{on 'click' this.addFragment}}
          >
            <AuIcon @icon={{AddIcon}} />
            <div class='say-snippet-button-text'>
              {{t 'snippet-plugin.snippet-node.add-fragment'}}
            </div>
          </button>
        </div>
      {{/if}}

    </div>
    <SearchModal
      @open={{this.showModal}}
      @closeModal={{this.closeModal}}
      @config={{this.node.attrs.config}}
      @onInsert={{this.onInsert}}
      @assignedSnippetListsIds={{this.node.attrs.assignedSnippetListsIds}}
    />
  </template>
}
