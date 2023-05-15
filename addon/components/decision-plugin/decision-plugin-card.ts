import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  insertMotivation,
  insertArticleContainer,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
import { SayController } from '@lblod/ember-rdfa-editor';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

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
    return this.controller.checkCommand(
      insertArticleContainer({ intl: this.intl }),
      {
        view: this.controller.mainEditorView,
      }
    );
  }
}
