import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import modifyDate from '../../commands/modify-date-command';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type Args = {
  controller: ProseController;
};
export default class RdfaDatePluginCardComponent extends Component<Args> {
  @tracked dateValue?: Date;
  @tracked dateRange?: { from: number; to: number };
  @tracked dateInDocument = false;
  @tracked onlyDate = false;
  @tracked showCard = false;

  get controller() {
    return this.args.controller;
  }

  @action
  modifyDate() {
    if (this.dateValue && this.dateRange) {
      this.controller.checkAndDoCommand(
        modifyDate(
          this.dateRange.from,
          this.dateRange.to,
          this.dateValue,
          this.onlyDate
        )
      );
    }
  }

  @action
  changeDate(date: Date) {
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
    const datatype = selectionParent.attrs['datatype'] as string;
    console.log(datatype);
    if (datatype === 'xsd:dateTime') {
      this.dateRange = {
        from: from.start(from.depth),
        to: from.end(from.depth),
      };
      const dateContent = selectionParent.attrs['content'] as string;
      this.dateValue = dateContent ? new Date(dateContent) : new Date();
      this.dateInDocument = !!dateContent;
      this.onlyDate = false;
      this.showCard = true;
    } else if (datatype === 'xsd:date') {
      this.dateRange = {
        from: from.start(from.depth),
        to: from.end(from.depth),
      };
      const dateContent = selectionParent.attrs['content'] as string;
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
