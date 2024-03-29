import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuidv4 } from 'uuid';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

type Args = {
  controller: SayController;
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
    const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;

    const defaultLabel = this.intl.t('variable.date.label', {
      locale: this.documentLanguage,
    });

    const node = this.schema.nodes.date.create({
      label: defaultLabel,
      value: null,
      mappingResource,
    });

    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );
  }
}
