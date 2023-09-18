import Component from '@glimmer/component';
import { replaceSelectionWithAddress } from './utils';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: SayController;
};

export default class VariablePluginAddressInsertVariableComponent extends Component<Args> {
  @tracked label?: string;

  get controller() {
    return this.args.controller;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insertAddress() {
    replaceSelectionWithAddress(this.controller, this.label);
  }
}
