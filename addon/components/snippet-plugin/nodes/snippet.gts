import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import SearchModal from '../search-modal';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import AuIcon, {
  type AuIconSignature,
} from '@appuniversum/ember-appuniversum/components/au-icon';
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

interface ButtonSig {
  Args: {
    isActive: boolean;
    onClick: () => void;
    icon: AuIconSignature['Args']['icon'];
    helpText: string;
  };
  Element: HTMLButtonElement;
}

const SnippetButton: TemplateOnlyComponent<ButtonSig> = <template>
  {{#if @isActive}}
    <button
      class='say-snippet-button'
      type='button'
      {{on 'click' @onClick}}
      ...attributes
    >
      <AuIcon @icon={{@icon}} @size='large' {{on 'click' @onClick}} />
      <div class='say-snippet-button-text'>
        {{t @helpText}}
      </div>
    </button>
  {{/if}}
</template>;

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
    this.controller.focus();
    this.showModal = true;
  }

  get allowMultipleSnippets() {
    return this.node.attrs.allowMultipleSnippets as boolean;
  }

  @action
  addFragment() {
    if (this.allowMultipleSnippets) {
      this.mode = 'add';
      this.openModal();
    }
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
        allowMultipleSnippets: this.allowMultipleSnippets,
      }),
    );
  }

  <template>
    <div class='say-snippet-card'>
      <div class='say-snippet-title'>{{this.node.attrs.title}}</div>
      <div class='say-snippet-content'>{{yield}}</div>
      <div class='say-snippet-icons' contenteditable='false'>
        <SnippetButton
          @icon={{SynchronizeIcon}}
          @helpText='snippet-plugin.snippet-node.change-fragment'
          @onClick={{this.editFragment}}
          @isActive={{this.isActive}}
        />
        <SnippetButton
          @icon={{BinIcon}}
          @helpText='snippet-plugin.snippet-node.remove-fragment'
          @onClick={{this.deleteFragment}}
          @isActive={{this.isActive}}
          class='say-snippet-remove-button'
        />
        {{#if this.allowMultipleSnippets}}
          <SnippetButton
            @icon={{AddIcon}}
            @helpText='snippet-plugin.snippet-node.add-fragment'
            @onClick={{this.addFragment}}
            @isActive={{this.isActive}}
          />
        {{/if}}
      </div>

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
