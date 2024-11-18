import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuidv4 } from 'uuid';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

type Args = {
  controller: SayController;
  templateMode?: boolean;
};

export default class DateInsertComponent extends Component<Args> {
  AddIcon = AddIcon;

  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  insert() {
    const mappingResource = `http://data.lblod.info/mappings/${
      this.args.templateMode ? '--ref-uuid4-' : ''
    }${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${
      this.args.templateMode ? '--ref-uuid4-' : ''
    }${uuidv4()}`;
    const defaultLabel = this.intl.t('variable.date.label', {
      locale: this.documentLanguage,
    });
    const label = defaultLabel;

    const variableId = uuidv4();
    const node = this.schema.nodes.date.create({
      rdfaNodeType: 'resource',
      subject: mappingResource,
      __rdfaId: variableId,
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
          object: sayDataFactory.literal('date'),
        },
      ],
      backlinks: [],
    });
    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }
}
