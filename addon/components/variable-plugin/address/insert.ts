import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { replaceSelectionWithAddress } from './utils';

type Args = {
  controller: SayController;
  templateMode?: boolean;
};

/**
 * @deprecated
 */
export default class InsertAddressComponent extends Component<Args> {
  AddIcon = AddIcon;

  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  insertAddress() {
    replaceSelectionWithAddress(
      this.controller,
      this.intl.t('variable.address.label', {
        locale: this.documentLanguage,
      }),
      this.args.templateMode,
    );
  }

  get canInsertAddress() {
    if (this.controller.activeEditorView.props.nodeViews?.address) {
      return true;
    } else {
      return false;
    }
  }
}
