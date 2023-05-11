import Component from '@glimmer/component';
import { action } from '@ember/object';
import { insertTitle } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
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
  insertTitle() {
    this.controller.doCommand(
      insertTitle({
        placeholderText: this.intl.t('besluit-plugin.insert.decision-title'),
      }),
      {
        view: this.controller.mainEditorView,
      }
    );
    this.focus();
  }

  get canInsertTitle() {
    return this.controller.checkCommand(
      insertTitle({
        placeholderText: this.intl.t('besluit-plugin.insert.decision-title'),
      }),
      {
        view: this.controller.mainEditorView,
      }
    );
  }
}
