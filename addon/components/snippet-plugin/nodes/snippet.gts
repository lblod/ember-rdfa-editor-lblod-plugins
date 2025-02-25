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
  NodeSelection,
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
import { recalculateNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/monads/recalculate-structure-numbers';
import { createSnippetPlaceholder } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet-placeholder';
import { hasDecendant } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/has-descendant';
import SnippetPlaceholder from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/nodes/placeholder';
import { getSnippetListUrisFromNode } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
import { Snippet } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface ButtonSig {
  Args: {
    isActive: boolean;
    icon: AuIconSignature['Args']['icon'];
    helpText: string;
  };
  Element: HTMLButtonElement;
}

const SnippetButton: TemplateOnlyComponent<ButtonSig> = <template>
  {{#if @isActive}}
    <button class='say-snippet-button' type='button' ...attributes>
      <AuIcon @icon={{@icon}} @size='large' />
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
  get schema() {
    return this.controller.schema;
  }
  get snippetOrPlaceholder() {
    return [
      this.schema.nodes.snippet,
      this.schema.nodes.snippet_placeholder,
    ].filter(Boolean);
  }
  get node() {
    return this.args.node;
  }
  get isPlaceholder() {
    return this.node.content.size === 0;
  }
  get allowMultipleSnippets() {
    return this.node.attrs.allowMultipleSnippets as boolean;
  }

  @action
  closeModal() {
    this.showModal = false;
  }
  openModal() {
    this.controller.focus();
    this.showModal = true;
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
      const matchingSnippetExists = hasDecendant(
        this.controller.mainEditorState.doc,
        (node) =>
          node !== this.node &&
          this.snippetOrPlaceholder.includes(node.type) &&
          node.attrs.placeholderId === this.node.attrs.placeholderId,
      );
      if (matchingSnippetExists) {
        this.controller.withTransaction((tr) => {
          return transactionCombinator(
            this.controller.mainEditorState,
            tr.deleteRange(position, position + this.node.nodeSize),
          )([recalculateNumbers]).transaction;
        });
      } else {
        const node = createSnippetPlaceholder({
          listProperties: {
            placeholderId: this.node.attrs.placeholderId,
            listUris: getSnippetListUrisFromNode(this.node),
            names: this.node.attrs.snippetListNames,
            importedResources: this.node.attrs.importedResources,
          },
          schema: this.schema,
          allowMultipleSnippets: this.allowMultipleSnippets,
        });

        this.args.controller.withTransaction(
          (tr) =>
            transactionCombinator(
              this.controller.mainEditorState,
              tr.replaceWith(position, position + this.node.nodeSize, node),
            )([recalculateNumbers]).transaction,
          { view: this.args.controller.mainEditorView },
        );
      }
    }
  }
  createSliceFromElement(element: Element) {
    return new Slice(
      ProseParser.fromSchema(this.schema).parse(element, {
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
    if (
      this.selection instanceof NodeSelection &&
      this.selection.node === this.node
    ) {
      return true;
    }
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
  onInsert(snippet: Snippet) {
    this.closeModal();
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
        content: snippet.content?.toHTML() ?? '',
        title: snippet.title ?? '',
        listProperties: {
          placeholderId: this.node.attrs.placeholderId,
          listUris: getSnippetListUrisFromNode(this.node),
          names: this.node.attrs.snippetListNames,
          importedResources: this.node.attrs.importedResources,
        },
        range: { start, end },
        allowMultipleSnippets: this.allowMultipleSnippets,
      }),
    );
  }

  <template>
    {{#if this.isPlaceholder}}
      <SnippetPlaceholder
        @node={{@node}}
        @selectNode={{@selectNode}}
        @insertSnippet={{this.editFragment}}
      />
    {{else}}
      <div class='say-snippet-card'>
        <div class='say-snippet-title'>
          <span class='au-c-badge au-c-badge--small say-snippet-title-icon'>
            <AuIcon @icon='plus-text' />
          </span>
          {{this.node.attrs.title}}
        </div>
        <div class='say-snippet-content'>
          {{yield}}
          <div class='say-snippet-icons' contenteditable='false'>
            <SnippetButton
              @icon={{SynchronizeIcon}}
              @helpText='snippet-plugin.snippet-node.change-fragment'
              {{on 'click' this.editFragment}}
              @isActive={{this.isActive}}
            />
            <SnippetButton
              @icon={{BinIcon}}
              @helpText='snippet-plugin.snippet-node.remove-fragment'
              {{on 'click' this.deleteFragment}}
              @isActive={{this.isActive}}
              class='say-snippet-remove-button'
            />
            {{#if this.allowMultipleSnippets}}
              <SnippetButton
                @icon={{AddIcon}}
                @helpText='snippet-plugin.snippet-node.add-fragment'
                {{on 'click' this.addFragment}}
                @isActive={{this.isActive}}
              />
            {{/if}}
          </div>
        </div>

      </div>
    {{/if}}
    <SearchModal
      @open={{this.showModal}}
      @closeModal={{this.closeModal}}
      @config={{this.node.attrs.config}}
      @onInsert={{this.onInsert}}
      @snippetListUris={{getSnippetListUrisFromNode this.node}}
      @snippetListNames={{this.node.attrs.snippetListNames}}
    />
  </template>
}
