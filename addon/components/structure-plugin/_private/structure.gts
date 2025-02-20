import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayView, Schema } from '@lblod/ember-rdfa-editor';
import { redacted } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/confidentiality-plugin';
import NestedProsemirror from '@lblod/ember-rdfa-editor-lblod-plugins/utils/nested-prosemirror';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didUpdate from '@ember/render-modifiers/modifiers/did-update';
import { element } from 'ember-element-helper';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { getNameForStructureType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import { StructureType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/structure-types';
import { romanize } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/utils/romanize';
import { Transaction } from '@lblod/ember-rdfa-editor';

interface Sig {
  Args: EmberNodeArgs;
  Blocks: {
    default: [];
  };
}
export default class Structure extends Component<Sig> {
  @service declare intl: IntlService;

  titleSchema = new Schema({
    nodes: {
      text: {},
      doc: {
        content: 'text*',
        toDOM: () => {
          return ['span', 0];
        },
      },
    },
    marks: {
      strong,
      em,
      underline,
      strikethrough,
      subscript,
      superscript,
      highlight,
      color,
      redacted,
    },
  });
  @tracked innerView?: SayView;
  /**
   * A time counter to store the last time an update to the title was added to
   * the history
   * */
  @tracked historyTimeStamp: number = 0;
  innerEditor: NestedProsemirror | null = null;

  get showPlaceholder() {
    return this.args.node.nodeSize === 0;
  }
  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  get tag() {
    return 'div';
  }
  get titleAttr() {
    return this.node.attrs.title as string;
  }
  get headerTag() {
    return this.node.attrs.headerTag as string;
  }
  get number() {
    return this.node.attrs.number as number;
  }
  get romanizeNumber() {
    return this.node.attrs.romanize as boolean;
  }
  get headerFormat() {
    return this.node.attrs.headerFormat as string;
  }

  get structureType() {
    return this.node.attrs.structureType as StructureType;
  }

  get fullLengthArticles() {
    return this.node.attrs.fullLengthArticles as boolean;
  }

  get structureName() {
    const docLang = this.controller.mainEditorState.doc.attrs.lang;
    if (this.headerFormat === 'name') {
      return getNameForStructureType(
        this.structureType,
        this.number,
        this.fullLengthArticles,
        this.intl,
        docLang,
      );
    } else {
      return '';
    }
  }
  get hasTitle() {
    return this.node.attrs.hasTitle;
  }

  get title() {
    const docLang = this.controller.mainEditorState.doc.attrs.lang;
    if (
      this.node.attrs.isOnlyArticle &&
      this.node.attrs.onlyArticleSpecialName
    ) {
      return this.intl.t('structure-plugin.only-article-title', {
        locale: docLang,
      });
    } else {
      return this.intl.t(
        `structure-plugin.format.${
          this.node.attrs.headerFormat || 'plain-number'
        }`,
        {
          locale: docLang,
          number: this.romanizeNumber ? romanize(this.number) : this.number,
          name: this.structureName,
        },
      );
    }
  }

  @action
  onAttrsUpdate() {
    if (this.titleAttr !== this.innerEditor?.htmlContent) {
      this.innerEditor?.setInnerHtmlContent(this.titleAttr);
    }
  }

  onTitleUpdate = (content: string, tr: Transaction) => {
    let addToHistory = false;
    // every character typed would normally trigger a history event
    // in normal editor operation, this is ok, as the history plugin is smart
    // enough to group adjacent edits made in a short timespan (default 500ms)
    //
    // but since we trigger an attribute update, the history plugin can no
    // longer recognize these edits as adjacent, so each character triggers
    // a history event. This makes undoing title edits tedious, so we mimic the
    // grouping here using the transaction timestamp
    if (tr.time - this.historyTimeStamp > 500) {
      addToHistory = true;
      this.historyTimeStamp = tr.time;
    }
    this.args.updateAttribute('title', content, !addToHistory);
  };
  onInnerEditorFocus = (view: SayView) => {
    this.controller.setActiveView(view);
  };
  @action
  initializeNestedEditor(target: HTMLElement) {
    this.innerEditor = new NestedProsemirror({
      target,
      schema: this.titleSchema,
      outerView: this.args.view,
      getPos: () => this.args.getPos(),
      controller: this.controller,
      onFocus: this.onInnerEditorFocus,
      onUpdateContent: this.onTitleUpdate,
      initialContent: this.titleAttr,
    });
  }
  @action
  focusInner() {
    this.innerView?.focus();
  }
  <template>
    <div
      class='say-structure'
      {{didUpdate this.onAttrsUpdate this.titleAttr}}
      {{on 'focus' this.focusInner}}
    >
      <div class='say-structure__header' contenteditable='false'>

        {{#let (element this.headerTag) as |Tag|}}
          <Tag class='say-structure__header-element'><span
              class='say-structure__name'
            >{{this.title}}</span>

            {{#if this.hasTitle}}
              <span
                {{didInsert this.initializeNestedEditor}}
                class='say-structure__title'
              />
            {{/if}}
          </Tag>
        {{/let}}
      </div>
      <div class='say-structure__content'>
        {{yield}}
      </div>
    </div>
  </template>
}
