import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type { SayController } from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';
import IntlService from 'ember-intl/services/intl';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

type Args = {
  controller: SayController;
};

export default class TextVariableInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label?: string;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
    const variableId = uuidv4();

    const placeholder = this.intl.t('variable.text.label', {
      locale: this.documentLanguage,
    });

    const label = this.label ?? placeholder;
    const node = this.schema.nodes.text_variable.create(
      {
        label,
        mappingResource,
        variableInstance,
        resource: mappingResource,
        subject: mappingResource,
        rdfaNodeType: 'resource',
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
          { type: 'attribute', predicate: DCT('type').full, object: 'text' },
          {
            type: 'content',
            predicate: EXT('content').full,
          },
        ],
      },
      this.schema.text('text'),
    );

    this.label = undefined;

    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );
  }
}
