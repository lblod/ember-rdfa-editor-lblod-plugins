import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RdfaDatePluginInsertComponent extends Component {
  get controller() {
    return this.args.controller;
  }
  @action
  insertDate() {
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(
        this.controller.schema.node(
          'inline_rdfa',
          {
            datatype: 'xsd:date',
            property: 'ext:content',
          },
          [this.controller.schema.text('${date}')]
        )
      );
    });
  }

  @action
  insertDateTime() {
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(
        this.controller.schema.node(
          'inline_rdfa',
          {
            datatype: 'xsd:dateTime',
            property: 'ext:content',
          },
          [this.controller.schema.text('${date and time}')]
        )
      );
    });
  }
}
