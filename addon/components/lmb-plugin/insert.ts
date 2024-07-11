import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { SayController } from '@lblod/ember-rdfa-editor';
import {
  LmbPluginConfig,
  createMandateeNode,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
import { v4 as uuidv4 } from 'uuid';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

interface Args {
  controller: SayController;
  config: LmbPluginConfig;
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
  onInsert(mandatee: Mandatee) {
    const mappingSubject = `http://data.lblod.info/mappings/${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
    const variableId = uuidv4();

    const label = this.intl.t('variable.person.label', {
      locale: this.controller.documentLanguage,
    });
    const node = this.controller.schema.nodes.person_variable.create({
      subject: mappingSubject,
      rdfaNodeType: 'resource',
      __rdfaId: variableId,
      mandatee,
      properties: [
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(EXT('Mapping').full),
        },
        {
          predicate: EXT('instance').full,
          object: sayDataFactory.namedNode(variableInstance),
        },
        {
          predicate: EXT('label').full,
          object: sayDataFactory.literal(label),
        },
        {
          predicate: DCT('type').full,
          object: sayDataFactory.literal('person'),
        },
      ],
    });

    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
    this.closeModal();
  }
}
