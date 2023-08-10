import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';
import { isNumber } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller: SayController;
};

export default class NumberInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label?: string;
  @tracked minimumValue = '';
  @tracked maximumValue = '';
  @tracked validMinimum = true;
  @tracked validMaximum = true;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
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

    const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;

    const node = this.schema.nodes.number.create({
      label: this.label,
      value: null,
      mappingResource,
      variableInstance,
      ...(isNumber(this.minimumValue) && {
        minimumValue: Number(this.minimumValue),
      }),
      ...(isNumber(this.maximumValue) && {
        maximumValue: Number(this.maximumValue),
      }),
    });

    this.label = undefined;
    this.minimumValue = '';
    this.maximumValue = '';

    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );
  }
}
