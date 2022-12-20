import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import modifyDate from '../../commands/modify-date-command';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { getRdfaAttribute } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
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
    const currentNode = from.parent.childBefore(from.parentOffset);
    console.log('CURRENT NODE: ', currentNode);
    const datatypes = getRdfaAttribute(currentNode, 'datatype');
    if (!datatypes.length) {
      this.showCard = false;
      this.dateRange = undefined;
      return;
    }
    // const { node: selectionParent, pos: parentPos } = ancestor;

    if (datatypes.includes('xsd:dateTime') || datatypes.includes('xsd:date')) {
      this.dateRange = {
        from: from.start(from.depth + 1),
        to: from.end(from.depth + 1),
      };
      const dateContent = getRdfaAttribute(currentNode, 'content').pop();
      this.dateValue = dateContent ? new Date(dateContent) : new Date();
      this.dateInDocument = !!dateContent;
      this.onlyDate = datatypes.includes('xsd:date');
      this.showCard = true;
    } else {
      this.dateRange = undefined;
      this.showCard = false;
    }
  }
}
