import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { tracked } from '@glimmer/tracking';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { getReplacePersonTransaction } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/replace-person';

type Args = {
  controller: SayController;
  config: LmbPluginConfig;
};

export default class PersonEditComponent extends Component<Args> {
  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  get selectedPersonNode() {
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.controller.schema.nodes.person_variable
    ) {
      const personNode: ResolvedPNode = {
        value: selection.node,
        pos: selection.from,
      };
      return personNode;
    }
    return;
  }

  get showCard() {
    return !!this.selectedPersonNode;
  }

  get isEditing() {
    const personNode = this.selectedPersonNode;
    return !!personNode?.value.attrs.value;
  }

  @action
  openModal() {
    this.controller.focus();
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  onUpdate(electee: Electee) {
    const personNode = unwrap(this.selectedPersonNode);
    this.controller.withTransaction(
      () =>
        getReplacePersonTransaction(
          this.controller.activeEditorState,
          personNode,
          electee,
        ).transaction,
    );
    this.closeModal();
  }
}
