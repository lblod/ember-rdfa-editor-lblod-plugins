import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuidv4 } from 'uuid';

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

    const node = this.schema.nodes.location.create(
      {
        mappingResource,
        variableInstance,
        label: this.label ?? placeholder,
        source: this.endpoint,
      },
      this.schema.node('placeholder', {
        placeholderText: placeholder,
      }),
    );

    this.label = undefined;

    this.controller.withTransaction(
      (tr) => {
        tr.replaceSelectionWith(node);
        if (tr.selection.$anchor.nodeBefore) {
          const resolvedPos = tr.doc.resolve(
            tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
          );
          tr.setSelection(new NodeSelection(resolvedPos));
        }
        return tr;
      },
      { view: this.controller.mainEditorView },
    );
  }
}
