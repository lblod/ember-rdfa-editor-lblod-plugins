import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { ValidationResult } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

interface Args {
  icon?: string;
  result: ValidationResult;

  controller?: SayController;
}

export default class ValidationItem extends Component<Args> {
  @service
  declare intl: IntlService;

  get result(): ValidationResult {
    return this.args.result;
  }

  get message(): string {
    return this.result.message;
  }

  get skin() {
    return this.result.severity;
  }

  get icon() {
    switch (this.result.severity) {
      case 'info':
        return 'info-circle';
      case 'warning':
        return 'alert-triangle';
      case 'violation':
        return 'cross';
      default:
        return 'info-circle';
    }
  }

  get controller() {
    return this.args.controller;
  }
}
