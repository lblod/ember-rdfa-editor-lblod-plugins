import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuidv4 } from 'uuid';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export type LocationInsertOptions = {
  endpoint: string;
};

type Args = {
  controller: SayController;
  options: LocationInsertOptions;
};

export default class LocationInsertComponent extends Component<Args> {
  @tracked label?: string;

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

  get endpoint() {
    return this.args.options.endpoint;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;

    const placeholder = this.intl.t('variable.location.label', {
      locale: this.documentLanguage,
    });
    const source = this.endpoint;
    const label = this.label ?? placeholder;
    const variableId = uuidv4();

    const node = this.schema.nodes.location.create(
      {
        mappingResource,
        variableInstance,
        label,
        source,
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
          {
            type: 'attribute',
            predicate: DCT('source').full,
            object: source,
          },

          {
            type: 'attribute',
            predicate: DCT('type').full,
            object: 'location',
          },
          {
            type: 'attribute',
            predicate: EXT('content').full,
            object: null,
          },
        ],
      },
      this.schema.node('placeholder', {
        placeholderText: placeholder,
      }),
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
