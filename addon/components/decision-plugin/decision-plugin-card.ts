import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  insertMotivation,
  insertArticleContainer,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
import { SayController } from '@lblod/ember-rdfa-editor';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { doValidation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';

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
    const result = doValidation(this.controller.activeEditorState, {
      besluit: [
        {
          name: 'at-least-one-article-container',
          focusNodeType: this.controller.activeEditorState.schema.nodes.besluit,
          path: ['article_container'],
          message: 'Document must contain at least one article container.',
          severity: 'violation',
          constraints: {
            minCount: 1,
          },
        },
      ],
    });
    return !result.conforms;
  }
}
