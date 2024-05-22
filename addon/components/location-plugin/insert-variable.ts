import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { SayController } from '@lblod/ember-rdfa-editor';
import { replaceSelectionWithAddress } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/node-utils';

type Args = {
  controller: SayController;
};

export default class VariablePluginAddressInsertVariableComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label?: string;

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insertAddress() {
    replaceSelectionWithAddress(
      this.controller,
      this.label ??
        this.intl.t('variable.address.label', {
          locale: this.documentLanguage,
        }),
    );
  }
}
