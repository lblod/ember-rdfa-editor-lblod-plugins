import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';

type Args = {
  controller: ProseController;
};
export default class InsertCustomRdfaCard extends Component<Args> {
  get controller() {
    return this.args.controller;
  }
  @action
  insertCustomRdfa() {
    const { selection } = this.controller.getState(true);
    const transaction = this.controller.state.tr.insert(
      selection.from,
      this.controller.schema.node(
        'custom_rdfa',
        {
          typeof: 'placeholder',
          resource: 'placeholder',
          property: 'placeholder',
        },
        this.controller.schema.node('placeholder', { placeholderText: 'text' })
      )
    );
    this.controller.view.dispatch(transaction);
  }
}
