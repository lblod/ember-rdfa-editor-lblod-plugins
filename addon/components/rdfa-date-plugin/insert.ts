import Component from '@glimmer/component';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type Args = {
  controller: ProseController;
};

export default class RdfaDatePluginInsertComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  insertDate(onlyDate: boolean) {
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(
        this.schema.node('date', {
          onlyDate,
        })
      );
    });
  }
}
