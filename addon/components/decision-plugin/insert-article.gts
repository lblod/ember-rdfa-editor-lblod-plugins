import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import insertArticle from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands/insert-article-command';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/utils/build-article-structure';
import { not } from 'ember-truth-helpers';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export interface InsertArticleOptions {
  uriGenerator?: () => string;
  insertFreely?: boolean;
  /** Pass a decision URI instead of finding one in the document. Implies `insertFreely`. */
  decisionUri?: string;
}
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

  get decisionLocation() {
    return this.decisionRange
      ? { pos: this.decisionRange.from, node: this.decisionRange.node }
      : null;
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
    if (!this.decisionLocation) {
      return false;
    }
    const article = buildArticleStructure(
      this.schema,
      this.args.options?.uriGenerator,
    );
    return this.controller.checkCommand(
      insertArticle({ node: article, decisionLocation: this.decisionLocation }),
    );
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
    this.controller.doCommand(
      insertArticle({
        node,
        insertFreely: true,
      }),
    );
    this.controller.focus();
  }

  @action
  insertInDecision(node: PNode) {
    if (!this.decisionLocation) {
      return;
    }
    this.controller.doCommand(
      insertArticle({
        node,
        decisionLocation: this.decisionLocation,
      }),
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
