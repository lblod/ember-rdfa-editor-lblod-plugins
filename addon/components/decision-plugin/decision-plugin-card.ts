import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  insertMotivation,
  insertArticleContainer,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
import { SayController } from '@lblod/ember-rdfa-editor';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';

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
    const state = this.controller.activeEditorState;
    const besluit = findParentNodeOfType(state.schema.nodes.besluit)(
      state.selection
    );
    if (!besluit) {
      return false;
    }
    let hasArticleBlock;
    besluit.node.descendants((node) => {
      if (node.type.name === 'article_container') {
        hasArticleBlock = true;
      }
    })
    return !hasArticleBlock;
  }
}
