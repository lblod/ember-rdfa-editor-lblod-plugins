import { SayController } from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import Component from '@glimmer/component';

type Args = {
  controller: SayController;
};
export default class InsertStructureComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  doInsert() {
    const structureNode = this.schema.nodes.structure.createAndFill();
    if (!structureNode) {
      return;
    }
    this.args.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(structureNode);
    });
  }
}
