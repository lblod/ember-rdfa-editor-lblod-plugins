import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { trackedFunction } from 'ember-resources/util/function';
import { tracked } from '@glimmer/tracking';
import { LmbPluginConfig, createMandateeNode } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';

type Args = {
  controller: SayController;
  config: LmbPluginConfig;
};

export default class CodelistEditComponent extends Component<Args> {
  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  selectedPersonNode = trackedFunction(this, () => {
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.controller.schema.nodes.person_variable
    ) {
      const personNode = {
        node: selection.node,
        pos: selection.from,
      };
      return personNode;
    }
    return;
  });

  get showCard() {
    return !!this.selectedPersonNode.value;
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
  onInsert(mandatee: Mandatee) {
    const mandateeNode = createMandateeNode(this.controller, mandatee)
    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(mandateeNode);
      },
      { view: this.controller.mainEditorView },
    );
    this.closeModal();
  }
}
