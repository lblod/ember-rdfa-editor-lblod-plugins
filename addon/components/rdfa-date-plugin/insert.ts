import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import {
  DateFormat,
  DateOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/rdfa-date-plugin';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

type Args = {
  controller: SayController;
  options: DateOptions;
};

export default class RdfaDatePluginInsertComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
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
