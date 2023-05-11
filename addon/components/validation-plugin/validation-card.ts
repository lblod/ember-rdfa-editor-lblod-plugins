import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { ValidationReport } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';

interface Args {
  report: ValidationReport;
  controller?: SayController;
  title: string;
}

export default class ValidationCardComponent extends Component<Args> {
  get shouldShow() {
    return !this.args.report.conforms;
  }

  get results() {
    return this.args.report.results ?? [];
  }
}
