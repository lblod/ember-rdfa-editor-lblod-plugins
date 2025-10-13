import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/utils/build-article-structure';
import { not } from 'ember-truth-helpers';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { insertArticle } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/actions/insert-article';
import { StructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/structure-types';

export type InsertArticleOptions = StructurePluginOptions & {
  insertFreely?: boolean;
  /** Pass a decision URI instead of finding one in the document. Implies `insertFreely`. */
  decisionUri?: string;
};
interface Sig {
  Args: {
    controller: SayController;
    label: string;
    options?: InsertArticleOptions;
  };
}

export default class InsertArticleComponent extends Component<Sig> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get options() {
    return this.args.options;
  }

  get label() {
    return this.args.label ?? this.intl.t('besluit-plugin.insert.article');
  }

  get schema() {
    return this.controller.schema;
  }

  get decisionRange() {
    return getCurrentBesluitRange(this.controller);
  }

  get decisionUri(): string | undefined {
    return this.decisionRange?.node.attrs.subject;
  }

  get canInsertFreely() {
    return this.options?.insertFreely || this.options?.decisionUri;
  }

  get canInsert() {
    if (this.canInsertFreely) {
      return true;
    } else {
      return this.canInsertInDecision;
    }
  }

  get canInsertInDecision() {
    if (!this.decisionUri) {
      return false;
    }
    const article = buildArticleStructure(
      this.schema,
      this.args.options?.uriGenerator,
    );
    return insertArticle({
      node: article,
      decisionUri: this.decisionUri,
    })(this.controller.mainEditorState).result;
  }

  @action
  doInsert() {
    const structureNode = buildArticleStructure(
      this.schema,
      this.args.options?.uriGenerator,
      this.args.options?.decisionUri,
    );
    if (this.canInsertFreely) {
      this.insertFreely(structureNode);
    } else {
      this.insertInDecision(structureNode);
    }
  }

  @action
  insertFreely(node: PNode) {
    this.controller.withTransaction(
      () => {
        return insertArticle({
          node,
          insertFreely: true,
        })(this.controller.mainEditorState).transaction;
      },
      { view: this.controller.mainEditorView },
    );
    this.controller.focus();
  }

  @action
  insertInDecision(node: PNode) {
    const { decisionUri } = this;
    if (!decisionUri) {
      return;
    }
    this.controller.withTransaction(
      () => {
        return insertArticle({
          node,
          decisionUri,
        })(this.controller.mainEditorState).transaction;
      },
      { view: this.controller.mainEditorView },
    );
    this.controller.focus();
  }

  <template>
    <li class='au-csidebar-list__item'>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        @disabled={{not this.canInsert}}
        {{on 'click' this.doInsert}}
      >
        {{this.label}}
      </AuButton>
    </li>
  </template>
}
