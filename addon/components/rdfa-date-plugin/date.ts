import Component from '@glimmer/component';
import {
  DecorationSource,
  NodeSelection,
  PNode,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import {
  formatDate,
  validateDateFormat,
} from '../../plugins/rdfa-date-plugin/utils';
import { DateOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  contentDecorations?: DecorationSource;
};

export default class VariableComponent extends Component<Args> {
  @action
  onClick() {
    const tr = this.args.controller.activeEditorState.tr;
    tr.setSelection(
      NodeSelection.create(
        this.args.controller.activeEditorState.doc,
        this.args.getPos() as number,
      ),
    );
    this.args.controller.activeEditorView.dispatch(tr);
  }

  get humanReadableDate() {
    const value = this.args.node.attrs.value as string;
    const format = this.args.node.attrs.format as string;
    if (value) {
      if (validateDateFormat(format).type === 'ok') {
        return formatDate(new Date(value), format);
      } else {
        return 'Ongeldig formaat';
      }
    } else {
      const options = this.args.node.type.spec.options as DateOptions;
      return (this.args.node.attrs.onlyDate as boolean)
        ? options.placeholder.insertDate
        : options.placeholder.insertDateTime;
    }
  }
}
