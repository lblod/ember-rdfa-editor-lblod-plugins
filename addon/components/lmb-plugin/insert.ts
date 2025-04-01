import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { SayController } from '@lblod/ember-rdfa-editor';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { Person } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { createPersonVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/actions/create-person-variable';

interface Args {
  controller: SayController;
  config: LmbPluginConfig;
  templateMode?: boolean;
}

export default class LmbPluginInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
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
  onInsert(electee: Electee) {
    const person: Person = {
      uri: electee.uri,
      firstName: electee.firstName,
      lastName: electee.lastName,
    };

    const label = this.intl.t('variable.person.label', {
      locale: this.controller.documentLanguage,
    });
    const node = createPersonVariable({
      schema: this.controller.schema,
      label,
      value: person,
    });

    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }
}
