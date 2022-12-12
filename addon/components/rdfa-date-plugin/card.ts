import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import modifyDate from '../../commands/modify-date-command';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
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
    const from = selection.$from;
    const ancestor = findAncestors(from, (node) => !!node.attrs['datatype'])[0];
    if (!ancestor) {
      this.showCard = false;
      this.dateRange = undefined;
      return;
    }
    const { node: selectionParent, pos: parentPos } = ancestor;
    const datatype = selectionParent.attrs['datatype'] as string;
    if (datatype === 'xsd:dateTime' || datatype === 'xsd:date') {
      this.dateRange = {
        from: parentPos + 1,
        to: parentPos + selectionParent.nodeSize - 1,
      };
      const dateContent = selectionParent.attrs['content'] as string;
      this.dateValue = dateContent ? new Date(dateContent) : new Date();
      this.dateInDocument = !!dateContent;
      this.onlyDate = datatype === 'xsd:date';
      this.showCard = true;
    } else {
      this.dateRange = undefined;
      this.showCard = false;
    }
  }
}
