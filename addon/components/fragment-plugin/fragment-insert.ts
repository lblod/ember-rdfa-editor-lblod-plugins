import { action } from '@ember/object';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { SayController } from '@lblod/ember-rdfa-editor';

interface Args {
  controller: SayController;
}

export default class FragmentInsertComponent extends Component<Args> {
  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  @action
  openModal() {
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }
}
