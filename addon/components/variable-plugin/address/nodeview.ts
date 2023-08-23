import Component from '@glimmer/component';
import { NodeSelection, PNode, SayController } from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/address';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  controller: SayController;
};
export default class AddressNodeviewComponent extends Component<Args> {
  get node() {
    return this.args.node;
  }

  get address() {
    return this.node.attrs.value as Address | null;
  }

  @action
  selectThisNode() {
    const tr = this.args.controller.activeEditorState.tr;
    tr.setSelection(
      NodeSelection.create(
        this.args.controller.activeEditorState.doc,
        this.args.getPos() as number,
      ),
    );
    this.args.controller.activeEditorView.dispatch(tr);
  }
}
