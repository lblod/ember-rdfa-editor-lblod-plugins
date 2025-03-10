import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { isNumber } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { modifier } from 'ember-modifier';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import { createNumberVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/actions/create-number-variable';

type Args = {
  controller: SayController;
  templateMode?: boolean;
};

export default class NumberInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label?: string;
  @tracked minimumValue = '';
  @tracked maximumValue = '';
  @tracked validMinimum = true;
  @tracked validMaximum = true;

  minimumInput = modifier((element: HTMLInputElement) => {
    this.validMinimum = element.checkValidity();
  });

  maximumInput = modifier((element: HTMLInputElement) => {
    this.validMaximum = element.checkValidity();
  });

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get numberVariableError() {
    if (!this.validMinimum || !this.validMaximum) {
      return this.intl.t('variable.number.error-not-number');
    }
    const minVal = this.minimumValue;
    const maxVal = this.maximumValue;
    if (
      isNumber(minVal) &&
      isNumber(maxVal) &&
      Number(minVal) > Number(maxVal)
    ) {
      return this.intl.t('variable.number.error-min-bigger-than-max');
    }

    return '';
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  updateMinimumValue = (event: InputEvent) => {
    const element = event.target as HTMLInputElement;
    this.validMinimum = element.checkValidity();
    this.minimumValue = element.value;
  };

  updateMaximumValue = (event: InputEvent) => {
    const element = event.target as HTMLInputElement;
    this.validMaximum = element.checkValidity();
    this.maximumValue = element.value;
  };

  @action
  insert() {
    if (this.numberVariableError !== '') return;
    const defaultLabel = this.intl.t('variable.number.label', {
      locale: this.documentLanguage,
    });
    const label = this.label ?? defaultLabel;
    const node = createNumberVariable({
      schema: this.schema,
      maximumValue: isNumber(this.maximumValue)
        ? Number(this.maximumValue)
        : undefined,
      minimumValue: isNumber(this.minimumValue)
        ? Number(this.minimumValue)
        : undefined,
      label,
    });

    this.label = undefined;
    this.minimumValue = '';
    this.maximumValue = '';

    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }
}
