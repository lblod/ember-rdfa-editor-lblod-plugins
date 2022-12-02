import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import modifyDate from '../../commands/modify-date-command';
export default class RdfaDatePluginCardComponent extends Component {
  @tracked dateValue;
  @tracked dateRange;
  @tracked dateInDocument;
  @tracked onlyDate;
  @tracked showCard;

  get controller() {
    return this.args.controller;
  }

  @action
  modifyDate() {
    this.controller.checkAndDoCommand(
      modifyDate(
        this.dateRange.start,
        this.dateRange.end,
        this.dateValue,
        this.onlyDate
      )
    );
  }

  @action
  changeDate(date) {
    this.dateValue = date;
    if (this.dateInDocument) this.modifyDate();
  }

  @action
  onSelectionChanged() {
    const selection = this.controller.state.selection;
    if (!selection.from) {
      this.showCard = false;
      return;
    }
    const from = selection.$from;
    const selectionParent = selection.$from.parent;
    const datatype = selectionParent.attrs['datatype'];
    console.log(datatype);
    if (datatype === 'xsd:dateTime') {
      this.dateRange = {
        start: from.start(from.depth),
        end: from.end(from.depth),
      };
      const dateContent = selectionParent.attrs['content'];
      this.dateValue = dateContent ? new Date(dateContent) : new Date();
      this.dateInDocument = !!dateContent;
      this.onlyDate = false;
      this.showCard = true;
    } else if (datatype === 'xsd:date') {
      this.dateRange = {
        start: from.start(from.depth),
        end: from.end(from.depth),
      };
      const dateContent = selectionParent.attrs['content'];
      this.dateValue = dateContent ? new Date(dateContent) : new Date();
      this.dateInDocument = !!dateContent;
      this.onlyDate = true;
      this.showCard = true;
    } else {
      this.dateRange = undefined;
      this.showCard = false;
    }
  }
}
