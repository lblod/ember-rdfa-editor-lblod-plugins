import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { SayController } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { addProperty } from '@lblod/ember-rdfa-editor/commands';
import {
  LPDC,
  type LpdcPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lpdc-plugin';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentBesluitURI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import { SRO } from '../../utils/constants';

interface Args {
  controller: SayController;
  config: LpdcPluginConfig;
}

export default class LpdcPluginsInsertComponent extends Component<Args> {
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

  get decisionUri() {
    return (
      this.args.config?.decisionUri ?? getCurrentBesluitURI(this.controller)
    );
  }

  get isButtonDisabled() {
    return !this.decisionUri;
  }

  @action
  onLpdcInsert(lpdc: LPDC) {
    if (!this.decisionUri) {
      throw new Error('No besluit found in selection');
    }

    const rdfaId = uuidv4();
    const uri = lpdc.uri;
    const name = lpdc.name;

    this.controller.withTransaction(
      (tr) => {
        const node = this.controller.schema.node(
          'inline_rdfa',
          {
            rdfaNodeType: 'resource',
            __rdfaId: rdfaId,
            subject: uri,
          },
          [this.controller.schema.text(name)],
        );

        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );

    this.controller.doCommand(
      addProperty({
        resource: this.decisionUri,
        property: {
          predicate: SRO('bekrachtigt').full,
          object: sayDataFactory.resourceNode(uri),
        },
      }),
    );

    this.closeModal();
  }
}
