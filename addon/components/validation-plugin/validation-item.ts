import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { ValidationResult } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { InfoCircleIcon } from '@appuniversum/ember-appuniversum/components/icons/info-circle';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';

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
    switch (this.result.severity) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'violation':
        return 'error';
      default:
        return 'info';
    }
  }

  get icon() {
    switch (this.result.severity) {
      case 'info':
        return InfoCircleIcon;
      case 'warning':
        return AlertTriangleIcon;
      case 'violation':
        return CrossIcon;
      default:
        return InfoCircleIcon;
    }
  }

  get controller() {
    return this.args.controller;
  }
}
