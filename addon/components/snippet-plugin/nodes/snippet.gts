import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { PlusTextIcon } from '@appuniversum/ember-appuniversum/components/icons/plus-text';
import { type EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import SearchModal from '../search-modal'
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  ProseParser,
  SayController,
  Slice,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';

interface Signature {
  Args: EmberNodeArgs;
  Blocks: {
    default: [];
  };
}

// We don't have a way to type template only components without ember-source 5, so create an empty
// class to allow for type checking
// eslint-disable-next-line ember/no-empty-glimmer-component-classes
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
    this.openModal()
  }
  @action
  editFragment() {
    this.mode = 'edit';
    this.openModal()
  }
  @action
  deleteFragment() {
    const position = this.args.getPos();
    if(position !== undefined) {
      this.controller.withTransaction((tr) => {
        return tr.deleteRange(
          position,
          position + this.node.nodeSize,
        );
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
  @action
  onInsert(content: string) {
    const assignedSnippetListsIds = this.node.attrs.assignedSnippetListsIds;
    let rangeStart = 0;
    let rangeEnd = 0;
    if(this.args.getPos() === undefined) return;
    if(this.mode === 'add') {
      // Add new snippet
      rangeStart = this.args.getPos() as number + this.node.nodeSize;
      rangeEnd = this.args.getPos() as number + this.node.nodeSize;
    } else {
      //Replace current snippet
      rangeStart = this.args.getPos() as number;
      rangeEnd = this.args.getPos() as number + this.node.nodeSize;
    }

    const domParser = new DOMParser();
    const parsed = domParser.parseFromString(content, 'text/html').body;
    const documentDiv = parsed.querySelector('div[data-say-document="true"]');

    this.closeModal();
    const parser = ProseParser.fromSchema(this.controller.schema);

    if (documentDiv) {
      return this.controller.withTransaction((tr: Transaction) => {
        return tr.replaceRangeWith(rangeStart, rangeEnd,
          this.controller.schema.node('snippet', {assignedSnippetListsIds: assignedSnippetListsIds},
            htmlToDoc(content, {
              schema: this.controller.schema,
              parser,
              editorView: this.controller.mainEditorView,
            }).content
          ),
        );
      });
    }

    this.controller.withTransaction((tr) =>
      tr.replaceRange(rangeStart, rangeEnd, this.createSliceFromElement(parsed)),
    );
    this.closeModal()
  }
  <template>
    <div class='say-snippet-card'>
      <div class='say-snippet-title'>Title</div>
      {{yield}}
      <div class='say-snippet-icons'>
        <button {{on 'click' this.addFragment}} class='say-snippet-button'>
          <AuIcon @icon='synchronize' @size='large'/>
        </button>
        <button {{on 'click' this.deleteFragment}} class='say-snippet-button say-snippet-remove-button'>
          <AuIcon @icon='bin'/>
        </button>
        <button {{on 'click' this.editFragment}} class='say-snippet-button'>
          <AuIcon @icon='add'/>
        </button>
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
