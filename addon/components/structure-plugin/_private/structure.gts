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
import {
  StructureType,
  getNameForStructureType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';

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
  @tracked titleContent = this.titleAttr;
  @tracked innerView?: SayView;
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
    return this.node.attrs.title;
  }
  get headerTag() {
    return this.node.attrs.headerTag;
  }
  get number() {
    return this.node.attrs.number;
  }

  get displayStructureName() {
    return this.node.attrs.displayStructureName as boolean;
  }

  get structureType() {
    return this.node.attrs.structureType as StructureType;
  }

  get fullLenghtArticles() {
    return this.node.attrs.fullLenghtArticles as boolean;
  }

  get structureName() {
    const docLang = this.controller.mainEditorState.doc.attrs.lang;
    if (this.displayStructureName) {
      return getNameForStructureType(
        this.structureType,
        this.number,
        this.fullLenghtArticles,
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
    if (
      this.node.attrs.isOnlyArticle &&
      !this.node.attrs.disableOnlyArticleSpecialName
    ) {
      const docLang = this.controller.mainEditorState.doc.attrs.lang;
      return this.intl.t('structure-plugin.only-article-title', {
        locale: docLang,
      });
    } else {
      return `${this.structureName} ${this.number}.`;
    }
  }

  @action
  onAttrsUpdate() {
    if (this.titleAttr !== this.innerEditor?.htmlContent) {
      this.innerEditor?.setInnerHtmlContent(this.titleAttr);
    }
  }

  onTitleUpdate = (content: string) => {
    this.args.updateAttribute('title', content);
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
      initialContent: this.titleContent,
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
          <Tag>{{this.title}}

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
