import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { SayController } from '@lblod/ember-rdfa-editor';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
import { v4 as uuid } from 'uuid';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  MANDAAT,
  FOAF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

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
    const schema = this.controller.schema;
    const firstNameUuid = uuid();
    const firstNameNode = schema.node(
      'inline_rdfa',
      {
        rdfaNodeType: 'literal',
        __rdfaId: firstNameUuid,
        backlinks: [
          {
            subject: sayDataFactory.literalNode(mandatee.personUri),
            predicate: FOAF('gebruikteVoornaam').prefixed,
          },
        ],
      },
      [schema.text(mandatee.firstName)],
    );
    const lastNameUuid = uuid();
    const lastNameNode = schema.node(
      'inline_rdfa',
      {
        rdfaNodeType: 'literal',
        __rdfaId: lastNameUuid,
        backlinks: [
          {
            subject: sayDataFactory.literalNode(mandatee.personUri),
            predicate: FOAF('familyName').prefixed,
          },
        ],
      },
      [schema.text(mandatee.lastName)],
    );

    const personNode = schema.node(
      'inline_rdfa',
      {
        rdfaNodeType: 'resource',
        subject: mandatee.personUri,
        properties: [
          {
            predicate: FOAF('gebruikteVoornaam').prefixed,
            object: sayDataFactory.literalNode(firstNameUuid),
          },
          {
            predicate: FOAF('familyName').prefixed,
            object: sayDataFactory.literalNode(lastNameUuid),
          },
        ],
        backlinks: [
          {
            subject: sayDataFactory.literalNode(mandatee.mandateeUri),
            predicate: MANDAAT('isBestuurlijkeAliasVan').prefixed,
          },
        ],
      },
      [firstNameNode, lastNameNode],
    );
    const mandateeNode = schema.node(
      'inline_rdfa',
      {
        rdfaNodeType: 'resource',
        subject: mandatee.mandateeUri,
        properties: [
          {
            predicate: MANDAAT('isBestuurlijkeAliasVan').prefixed,
            object: sayDataFactory.resourceNode(mandatee.personUri),
          },
        ],
      },
      [personNode],
    );
    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(mandateeNode);
      },
      { view: this.controller.mainEditorView },
    );
    this.closeModal();
  }
}
