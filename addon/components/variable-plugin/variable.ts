import Component from '@glimmer/component';
import { SayController, SayView, Selection } from '@lblod/ember-rdfa-editor';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

type Args = {
  controller: SayController;
};

export default class VariableComponent extends Component<Args> {
  @tracked innerView?: SayView;
  onClick() {
    if (this.innerView) {
      this.innerView.state.tr.setSelection(
        Selection['atStart'](this.innerView.state.doc)
      );
    }
  }
  @action
  initEditor(view: SayView) {
    this.innerView = view;
  }
}
