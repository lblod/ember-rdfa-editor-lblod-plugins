import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { NodeSelection } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: ProseController;
};
const shortFormat = 'dd/mm/yy';
const longFormat = 'EEEE dd MMMM yyyy';
export default class RdfaDatePluginCardComponent extends Component<Args> {
  @tracked dateValue?: Date;
  @tracked datePos?: number;
  @tracked dateInDocument = false;
  @tracked onlyDate = false;
  @tracked dateFormat = '';
  @tracked customDateFormat = 'dd/mm/yyyy';

  get controller() {
    return this.args.controller;
  }

  @action
  modifyDate() {
    console.log('changing date');
    if (this.datePos && this.dateValue) {
      const pos = this.datePos;
      const value = this.dateValue;
      this.controller.withTransaction((tr) => {
        tr.setNodeAttribute(pos, 'format', this.customDateFormat);
        return tr.setNodeAttribute(pos, 'value', value.toISOString());
      });
    }
  }

  @action
  changeDate(date: Date) {
    this.dateValue = date;
    if (this.dateInDocument) this.modifyDate();
  }

  @action
  setDateFormat(dateFormat: string) {
    this.dateFormat = dateFormat;
    if (dateFormat === 'short') {
      this.customDateFormat = shortFormat;
    } else if (dateFormat === 'long') {
      this.customDateFormat = longFormat;
    }
    if (this.dateInDocument) this.modifyDate();
  }
  @action
  setCustomDateFormat(event: InputEvent) {
    this.customDateFormat = (event.target as HTMLInputElement).value;
    if (this.dateInDocument) this.modifyDate();
  }

  get showCard() {
    return this.datePos !== undefined && this.datePos !== null;
  }

  @action
  onSelectionChanged() {
    const selection = this.controller.state.selection;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.args.controller.schema.nodes['date']
    ) {
      this.dateInDocument = !!selection.node.attrs.value;
      this.onlyDate = selection.node.attrs.onlyDate as boolean;
      this.dateValue = this.dateInDocument
        ? new Date(selection.node.attrs.value)
        : new Date();
      if (this.dateInDocument) {
        this.dateValue = new Date(selection.node.attrs.value);
      } else {
        this.dateValue = new Date();
        if (this.onlyDate) {
          this.dateValue.setHours(0, 0, 0, 0);
        }
      }
      this.datePos = selection.from;
    } else {
      this.datePos = undefined;
    }
  }
}
