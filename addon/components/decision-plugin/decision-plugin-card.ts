import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  insertMotivation,
  insertArticleContainer,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
import { SayController } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { VALIDATION_KEY } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';

type Args = {
  controller: SayController;
};

/**
 * @deprecated
 */
export default class DecisionPluginCard extends Component<Args> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  focus() {
    this.controller.focus();
  }

  @action
  insertMotivation() {
    this.controller.doCommand(insertMotivation({ intl: this.intl }), {
      view: this.controller.mainEditorView,
    });
    this.focus();
  }

  get canInsertMotivation() {
    return this.controller.checkCommand(insertMotivation({ intl: this.intl }), {
      view: this.controller.mainEditorView,
    });
  }

  @action
  insertArticleBlock() {
    this.controller.doCommand(insertArticleContainer({ intl: this.intl }), {
      view: this.controller.mainEditorView,
    });
    this.focus();
  }

  get missingArticleBlock() {
    const state = VALIDATION_KEY.getState(this.controller.activeEditorState);
    if (state) {
      let missingArticleBlock = false;
      const results = state.report.results;
      if (!results) return false;
      for (const result of results) {
        if (result.sourceShape.name === 'at-least-one-article-container') {
          missingArticleBlock = true;
        }
      }
      return missingArticleBlock;
    } else {
      return false;
    }
  }
}
