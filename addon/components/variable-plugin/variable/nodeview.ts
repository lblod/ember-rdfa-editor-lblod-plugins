import Component from '@glimmer/component';
import {
  NodeSelection,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';

type Args = {
  controller: SayController;
};

export default class VariableNodeViewComponent extends Component<Args> {
  PencilIcon = PencilIcon;

  @tracked innerView?: SayView;

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
}
