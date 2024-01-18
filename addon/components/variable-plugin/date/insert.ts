import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { SayController, Transaction } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuidv4 } from 'uuid';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

type Args = {
  controller: SayController;
};

export default class DateInsertComponent extends Component<Args> {
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
    const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;

    const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
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
          type: 'attribute',
          predicate: RDF('type').full,
          object: EXT('Mapping').full,
        },
        {
          type: 'attribute',
          predicate: EXT('instance').full,
          object: variableInstance,
        },
        {
          type: 'attribute',
          predicate: EXT('label').full,
          object: label,
        },
        { type: 'attribute', predicate: DCT('type').full, object: 'date' },
      ],
      backlinks: [],
    });
    console.log(node);

    this.controller.withTransaction(
      (tr: Transaction) => {
        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );
  }
}
