import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { SayController } from '@lblod/ember-rdfa-editor';
import { LmbPluginConfig, createMandateeNode } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';

interface Args {
  controller: SayController;
  config: LmbPluginConfig;
}

export default class LmbPluginInsertComponent extends Component<Args> {
  AddIcon = AddIcon;

  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  @action
  openModal() {
    this.controller.focus();
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  onInsert(mandatee: Mandatee) {
    const mandateeNode = createMandateeNode(this.controller, mandatee)
    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(mandateeNode);
      },
      { view: this.controller.mainEditorView },
    );
    this.closeModal();
  }
}
