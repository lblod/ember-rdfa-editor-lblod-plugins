import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { SayController } from '@lblod/ember-rdfa-editor';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
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
    const schema = this.controller.schema
    const node = schema.nodes.inline_rdfa.create({
      about: mandatee.personUri,
    },[
      schema.nodes.inline_rdfa.create({
        property: 'mandaat:isBestuurlijkeAliasVan'
      }, [
        schema.nodes.inline_rdfa.create({
          about: mandatee.personUri
        }, [
          schema.text(mandatee.fullName)
        ])
      ])
    ])
    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );
    this.closeModal();
  }
}
