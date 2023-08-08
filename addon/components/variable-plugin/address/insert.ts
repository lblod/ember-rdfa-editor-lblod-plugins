import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';

type Args = {
  controller: SayController;
};

export default class InsertAddressComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  insertAddress() {
    const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
    this.controller.withTransaction((tr) => {
      tr.replaceSelectionWith(
        this.schema.node('address', { mappingResource, variableInstance }),
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
