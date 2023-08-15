import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

export default class TemplateCommentsPluginTemplateCommentComponent extends Component<EmberNodeArgs> {
  get controller() {
    return this.args.controller;
  }

  get selectionInside() {
    const { pos: selectPos } = this.controller.mainEditorState.selection.$from;
    const nodePos = this.args.getPos();
    const startSelectionInsideNode =
      nodePos !== undefined &&
      selectPos > nodePos &&
      selectPos < nodePos + this.args.node.nodeSize;
    return startSelectionInsideNode;
  }
}
