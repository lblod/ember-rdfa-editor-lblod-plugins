import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import t from 'ember-intl/helpers/t';
import IntlService from 'ember-intl/services/intl';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { SayController } from '@lblod/ember-rdfa-editor';
import AuNativeInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/au-native-input';
import { replaceSelectionWithAddress } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/node-utils';

interface Signature {
  Args: {
    controller: SayController;
  };
}

export default class VariablePluginAddressInsertVariableComponent extends Component<Signature> {
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
        this.intl.t('location-plugin.default-label', {
          locale: this.documentLanguage,
        }),
    );
  }

  <template>
    <AuFormRow>
      <AuLabel for='label'>
        {{t 'location-plugin.label'}}
      </AuLabel>
      <AuNativeInput
        id='label'
        placeholder={{t 'location-plugin.labelPlaceholder'}}
        @type='text'
        @width='block'
        value={{this.label}}
        {{on 'input' this.updateLabel}}
      />
    </AuFormRow>
    <AuButton {{on 'click' this.insertAddress}}>
      {{t 'common.insert'}}
    </AuButton>
  </template>
}
