import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { DateFormat } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';

type Args = {
  controller: ProseController;
  widgetArgs: {
    options: {
      formats: [DateFormat];
      allowCustomFormat: boolean;
    };
  };
};
export default class RdfaDatePluginCardComponent extends Component<Args> {
  @tracked dateValue?: Date;
  @tracked datePos?: number;
  @tracked dateInDocument = false;
  @tracked onlyDate = false;
  @tracked dateFormat = '';
  @tracked customDateFormat = 'dd/MM/yyyy';

  get controller() {
    return this.args.controller;
  }

  @action
  modifyDate() {
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
    if (dateFormat !== 'custom') {
      const format = this.args.widgetArgs.options.formats.find(
        (format) => format.key === dateFormat
      );
      if (format) {
        if (this.onlyDate) {
          this.customDateFormat = format.dateFormat;
        } else {
          this.customDateFormat = format.dateTimeFormat;
        }
      }
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
