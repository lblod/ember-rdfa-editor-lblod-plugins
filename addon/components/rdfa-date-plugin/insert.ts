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
  insertDate() {
    this.controller.withTransaction((tr) => {
      const dateNode = this.schema.text('${date}', [
        this.schema.mark('inline_rdfa', {
          datatype: 'xsd:date',
          property: 'ext:content',
        }),
      ]);
      return tr.replaceSelectionWith(dateNode, false);
    });
  }

  @action
  insertDateTime() {
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(
        this.schema.text('${date and time}', [
          this.schema.mark('inline_rdfa', {
            datatype: 'xsd:dateTime',
            property: 'ext:content',
          }),
        ]),
        false
      );
    });
  }
}
