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
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import {
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { v4 as uuidv4 } from 'uuid';

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
      })[0]
    return ancestor && ancestor.node === this.node;
  }
  @action
  onInsert(content: string, title: string) {
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
          this.controller.schema.node('snippet', {assignedSnippetListsIds, title, subject: `http://example.net/lblod-snippet/${uuidv4()}`},
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
      <div class='say-snippet-title'>{{this.node.attrs.title}}</div>
      {{yield}}
      {{#if this.isActive}}
        <div class='say-snippet-icons'>
          <button {{on 'click' this.editFragment}} class='say-snippet-button'>
            <AuIcon @icon='synchronize' @size='large'/>
            <div class='say-snippet-button-text'>
              Change Fragment
            </div>
          </button>
          <button {{on 'click' this.deleteFragment}} class='say-snippet-button say-snippet-remove-button'>
            <AuIcon @icon='bin'/>
            <div class='say-snippet-button-text'>
              Remove Fragment
            </div>
          </button>
          <button {{on 'click' this.addFragment}} class='say-snippet-button'>
            <AuIcon @icon='add'/>
             <div class='say-snippet-button-text'>
              Add another fragment from the same lists
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
