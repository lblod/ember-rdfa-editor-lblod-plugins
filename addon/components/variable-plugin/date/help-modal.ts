import { action } from '@ember/object';
import Component from '@glimmer/component';
import { formatDate } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/date-helpers';

interface Args {
  modalOpen: boolean;
  closeModal: () => void;
}

export default class DateHelpComponent extends Component<Args> {
  exampleDate: Date = new Date();

  @action
  formatExample(format: string) {
    return formatDate(this.exampleDate, format);
  }
}
