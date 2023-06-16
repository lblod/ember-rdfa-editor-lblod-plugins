import { action } from '@ember/object';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { ProseParser, SayController } from '@lblod/ember-rdfa-editor';
import { FragmentPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/fragment-plugin';

interface Args {
  controller: SayController;
  config: FragmentPluginConfig;
}

export default class FragmentInsertComponent extends Component<Args> {
  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  get config() {
    return this.args.config;
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
  onInsert(content: string) {
    const domParser = new DOMParser();

    this.closeModal();

    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(
        ProseParser.fromSchema(this.controller.schema).parse(
          domParser.parseFromString(content, 'text/html')
        )
      );
    });
  }
}
