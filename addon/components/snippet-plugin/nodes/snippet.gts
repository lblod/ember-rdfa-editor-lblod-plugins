import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import SearchModal from '../search-modal';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';
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
import { createAndInsertSnippet } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet';

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
  <button
    class='say-snippet-button {{if @isActive "" "say-snippet-hidden"}}'
    disabled={{(not @isActive)}}
    type='button'
    {{on 'click' @onClick}}
    ...attributes
  >
    {{#if @isActive}}
      <AuIcon @icon={{@icon}} @size='large' {{on 'click' @onClick}} />
      <div class='say-snippet-button-text'>
        {{t @helpText}}
      </div>
    {{/if}}
  </button>
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
        return tr.deleteRange(position, position + this.node.nodeSize);
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
    let rangeStart = 0;
    let rangeEnd = 0;
    if (this.args.getPos() === undefined) return;
    if (this.mode === 'add') {
      // Add new snippet
      rangeStart = (this.args.getPos() as number) + this.node.nodeSize;
      rangeEnd = (this.args.getPos() as number) + this.node.nodeSize;
    } else {
      //Replace current snippet
      rangeStart = this.args.getPos() as number;
      rangeEnd = (this.args.getPos() as number) + this.node.nodeSize;
    }

    const domParser = new DOMParser();
    const parsed = domParser.parseFromString(content, 'text/html').body;
    const documentDiv = parsed.querySelector('div[data-say-document="true"]');

    this.closeModal();

    if (documentDiv) {
      return createAndInsertSnippet(
        {
          controller: this.controller,
          content,
          title,
          snippetListIds: this.node.attrs.assignedSnippetListsIds,
          importedResources: this.node.attrs.importedResources,
        },
        (tr, snippet) => tr.replaceRangeWith(rangeStart, rangeEnd, snippet),
      );
    }

    this.controller.withTransaction((tr) =>
      tr.replaceRange(
        rangeStart,
        rangeEnd,
        this.createSliceFromElement(parsed),
      ),
    );
    this.closeModal();
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
        <SnippetButton
          @icon={{AddIcon}}
          @helpText='snippet-plugin.snippet-node.add-fragment'
          @onClick={{this.addFragment}}
          @isActive={{this.isActive}}
        />
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
