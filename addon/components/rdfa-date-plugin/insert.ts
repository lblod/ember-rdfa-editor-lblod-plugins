import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { SayController } from '@lblod/ember-rdfa-editor';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import {
  DateFormat,
  DateOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller: SayController;
  options: DateOptions;
};

export default class RdfaDatePluginInsertComponent extends Component<Args> {
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

  get formats(): DateFormat[] {
    return this.args.options.formats;
  }

  get defaultDateFormat(): Option<string> {
    return this.formats[0].dateFormat;
  }

  @action
  insertDate() {
    this.controller.withTransaction((tr) => {
      tr.replaceSelectionWith(
        this.schema.node('date', {
          onlyDate: true,
          format: this.defaultDateFormat,
          value: new Date().toISOString(),
          label: this.intl.t('variable.date.label', {
            locale: this.documentLanguage,
          }),
        }),
      );
      if (tr.selection.$anchor.nodeBefore) {
        const resolvedPos = tr.doc.resolve(
          tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
        );
        tr.setSelection(new NodeSelection(resolvedPos));
      }
      return tr;
    });
  }
}
