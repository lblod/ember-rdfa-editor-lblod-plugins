import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import insertArticle from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands/insert-article-command';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/utils/build-article-structure';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';

export interface InsertArticleOptions {
  uriGenerator?: () => string;
}
interface Sig {
  Args: { controller: SayController; options?: InsertArticleOptions };
}
export default class InsertArticleComponent extends Component<Sig> {
  get controller() {
    return this.args.controller;
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
  get canInsert() {
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
    );
    if (!structureNode) {
      return;
    }
    if (!this.decisionLocation) {
      return;
    }
    this.controller.doCommand(
      insertArticle({
        node: structureNode,
        decisionLocation: this.decisionLocation,
      }),
    );
    this.controller.focus();
  }

  <template>
    <li class='au-csidebar-list__item'>
      <AuButton
        @icon='add'
        @iconAlignment='left'
        @skin='link'
        @disabled={{not this.canInsert}}
        {{on 'click' this.doInsert}}
      >
        {{t 'besluit-plugin.insert.article'}}
      </AuButton>
    </li>
  </template>
}
