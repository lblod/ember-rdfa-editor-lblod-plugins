import Component from '@glimmer/component';
import { action } from '@ember/object';
import { insertTitle } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-plugin/commands';
import { ProseController } from '@lblod/ember-rdfa-editor';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller: ProseController;
};

export default class BesluitPluginCardComponent extends Component<Args> {
  @service declare intl: IntlService;
  get controller() {
    return this.args.controller;
  }

  focus() {
    this.controller.focus();
  }

  @action
  insertTitle() {
    this.controller.doCommand(insertTitle(this.intl));
    this.focus();
  }

  get canInsertTitle() {
    return this.controller.checkCommand(insertTitle(this.intl));
  }
}
