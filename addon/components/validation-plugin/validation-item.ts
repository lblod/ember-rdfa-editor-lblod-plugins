import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { ValidationReport } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

interface Args {
  icon?: string;
  report: ValidationReport;

  controller?: SayController;
}

export default class ValidationItem extends Component<Args> {
  @service
  declare intl: IntlService;

  get report(): ValidationReport {
    return this.args.report;
  }

  get title(): string {
    return this.report.type;
  }

  get message(): string {
    return this.report.message;
  }

  get skin() {
    return this.report.severity;
  }

  get icon() {
    switch (this.report.severity) {
      case 'success':
        return 'check';
      case 'info':
        return 'info-circle';
      case 'error':
        return 'cross';
      case 'warning':
        return 'alert-triangle';
      default:
        return 'info-circle';
    }
  }

  get fixMessage() {
    return (
      this.report.fixMessage ||
      this.intl.t('validation-plugin.default-fix-message')
    );
  }

  get fixCommand() {
    return this.report.fixCommand;
  }

  get controller() {
    return this.args.controller;
  }

  @action
  doFix() {
    if (this.controller && this.fixCommand) {
      this.controller.doCommand(this.fixCommand);
    }
  }
}
