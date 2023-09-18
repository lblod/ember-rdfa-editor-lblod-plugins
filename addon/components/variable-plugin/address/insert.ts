import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { replaceSelectionWithAddress } from './utils';

type Args = {
  controller: SayController;
};

export default class InsertAddressComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  @action
  insertAddress() {
    replaceSelectionWithAddress(this.controller);
  }

  get canInsertAddress() {
    if (this.controller.activeEditorView.props.nodeViews?.address) {
      return true;
    } else {
      return false;
    }
  }
}
