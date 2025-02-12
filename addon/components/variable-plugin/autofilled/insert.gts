import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { type SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import AuNativeInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/au-native-input';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import LabelInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/utils/label-input';
import { createAutofilledVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/actions/create-autofilled-variable';
import {
  generateVariableInstanceUri,
  generateVariableUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/variable-helpers';

type Args = {
  controller: SayController;
  templateMode?: boolean;
};

export default class AutoFilledVariableInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label: string = '';
  @tracked autofillKey?: string;
  @tracked convertToString?: boolean;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  updateAutofillKey(event: InputEvent) {
    this.autofillKey = (event.target as HTMLInputElement).value;
  }

  @action
  updateConvertToString(value: boolean) {
    this.convertToString = value;
  }

  @action
  insert() {
    const placeholder = this.intl.t('variable.autofilled.label', {
      locale: this.documentLanguage,
    });

    const label =
      this.label != '' ? this.label : this.autofillKey || placeholder;
    const node = createAutofilledVariable({
      schema: this.schema,
      variable: generateVariableUri(),
      variableInstance: generateVariableInstanceUri({
        templateMode: this.args.templateMode,
      }),
      label,
      autofillKey: this.autofillKey,
      convertToString: this.convertToString,
    });
    this.label = '';

    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }
  <template>
    <AuFormRow>
      <LabelInput @label={{this.label}} @updateLabel={{this.updateLabel}} />
    </AuFormRow>
    <AuFormRow>
      <AuLabel for='autofill_key'>
        {{t 'variable-plugin.autofill.autofillKey'}}
      </AuLabel>
      <AuNativeInput
        id='autofill_key'
        placeholder={{t 'variable-plugin.autofill.autofillKeyPlaceholder'}}
        @type='text'
        @width='block'
        value={{this.autofillKey}}
        {{on 'input' this.updateAutofillKey}}
      />
    </AuFormRow>
    <AuFormRow>
      <AuCheckbox
        id='convert_to_string'
        @checked={{this.convertToString}}
        @onChange={{this.updateConvertToString}}
      >
        {{t 'variable-plugin.autofill.convertToString'}}
      </AuCheckbox>
    </AuFormRow>
    <AuButton {{on 'click' this.insert}}>
      {{t 'variable-plugin.button'}}
    </AuButton>
  </template>
}
