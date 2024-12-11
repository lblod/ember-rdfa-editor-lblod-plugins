import Component from '@glimmer/component';
import { replaceSelectionWithAddress } from './utils';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller: SayController;
  templateMode?: boolean;
};

/**
 * @deprecated Use oslo_location node instead which inserts valid OSLO model RDFa and supports
 * linking to the document it is in.
 */
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
      this.args.templateMode,
    );
  }
}
