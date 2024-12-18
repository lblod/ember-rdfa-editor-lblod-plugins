import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

import { SayController } from '@lblod/ember-rdfa-editor';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
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
import { Person } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';

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
    const mappingSubject = `http://data.lblod.info/mappings/${
      this.args.templateMode ? '--ref-uuid4-' : ''
    }${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${
      this.args.templateMode ? '--ref-uuid4-' : ''
    }${uuidv4()}`;
    const variableId = uuidv4();

    const person: Person = {
      uri: electee.uri,
      firstName: electee.firstName,
      lastName: electee.lastName,
    };

    const label = this.intl.t('variable.person.label', {
      locale: this.controller.documentLanguage,
    });
    const node = this.controller.schema.nodes.person_variable.create({
      subject: mappingSubject,
      rdfaNodeType: 'resource',
      __rdfaId: variableId,
      value: person,
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
  }
}
