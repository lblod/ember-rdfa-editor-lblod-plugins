import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';

type Args = {
  controller: SayController;
};

export default class DateVariableInsertComponent extends Component<Args> {
  @tracked label?: string;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
    const node = this.schema.nodes.date.create({
      label: this.label,
      value: null,
      mappingResource,
    });

    this.label = undefined;

    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );
  }
}
