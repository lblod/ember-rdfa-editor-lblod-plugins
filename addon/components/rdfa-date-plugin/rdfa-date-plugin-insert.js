import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RdfaDatePluginInsertComponent extends Component {
  @action
  insertDate() {
    const selection = this.args.controller.selection.lastRange;
    this.args.controller.executeCommand(
      'insert-html',
      '<span datatype="xsd:date" property="ext:content">${date}</span>',
      selection
    );
  }

  @action
  insertDateTime() {
    const selection = this.args.controller.selection.lastRange;
    this.args.controller.executeCommand(
      'insert-html',
      '<span datatype="xsd:dateTime" property="ext:content">${date and time}</span>',
      selection
    );
  }
}
