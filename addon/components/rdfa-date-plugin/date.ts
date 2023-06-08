import Component from '@glimmer/component';
import {
  DecorationSource,
  NodeSelection,
  PNode,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';

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
        this.args.getPos() as number
      )
    );
    this.args.controller.activeEditorView.dispatch(tr);
  }
}
