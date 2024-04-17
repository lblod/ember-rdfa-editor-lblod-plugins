import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { SayController } from '@lblod/ember-rdfa-editor';
import { WorshipPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin';
import { WorshipService } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin/utils/fetchWorshipServices';
import { insertWorshipService } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin/utils/insertWorshipService';

interface Args {
  controller: SayController;
  config: WorshipPluginConfig;
}

export default class WorshipPluginInsertComponent extends Component<Args> {
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
  onInsert(service: WorshipService) {
    insertWorshipService(this.controller, service);
    this.closeModal();
  }
}
