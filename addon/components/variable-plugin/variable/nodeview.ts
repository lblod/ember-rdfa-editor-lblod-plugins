import Component from '@glimmer/component';
import { NodeSelection, ProsePlugin, SayView } from '@lblod/ember-rdfa-editor';
import { editableNodePlugin } from '@lblod/ember-rdfa-editor/plugins/editable-node';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { DCT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

export default class VariableNodeViewComponent extends Component<EmberNodeArgs> {
  @tracked innerView?: SayView;

  get plugins(): ProsePlugin[] {
    return [editableNodePlugin(this.args.getPos)];
  }
  @action
  onClick() {
    if (this.innerView) {
      if (this.innerView.state.doc.firstChild?.type.name === 'placeholder') {
        this.innerView.focus();
        // Use request animation frame to only change the selection when the focus has been established
        window.requestAnimationFrame(() => {
          if (this.innerView) {
            const tr = this.innerView.state.tr;
            tr.setSelection(NodeSelection.create(this.innerView?.state.doc, 0));
            this.innerView?.dispatch(tr);
          }
        });
      } else {
        this.innerView.focus();
      }
    }
  }
  @action
  initEditor(view: SayView) {
    this.innerView = view;
  }
  @action
  resetVariable() {
    if (this.innerView && this.innerView.state.doc.childCount === 0) {
      const tr = this.innerView.state.tr;
      const placeholderNode = this.innerView.state.schema.node('placeholder', {
        placeholderText: this.label,
      });
      tr.insert(0, placeholderNode);
      this.innerView?.dispatch(tr);
    }
  }
  get label() {
    const labelTriple = getOutgoingTriple(this.args.node.attrs, DCT('title'));
    if (labelTriple) {
      return labelTriple.object.value;
    } else {
      return this.args.node.attrs.label;
    }
  }
  get class() {
    return getClassnamesFromNode(this.args.node);
  }
}
