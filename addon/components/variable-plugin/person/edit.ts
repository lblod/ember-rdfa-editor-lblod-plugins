import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController, PNode } from '@lblod/ember-rdfa-editor';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { trackedFunction } from 'ember-resources/util/function';
import { tracked } from '@glimmer/tracking';
import { LmbPluginConfig, createMandateeNode } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';

type Args = {
  controller: SayController;
  config: LmbPluginConfig;
};

type PersonNode = {
  node: PNode;
  pos: number;
}

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
      const personNode : PersonNode = {
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

  get isEditing() {
    const personNode = this.selectedPersonNode.value;
    return !!personNode?.node.attrs.mandatee;
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
    const personNode = this.selectedPersonNode.value as PersonNode;
    this.controller.withTransaction((tr) => {
      tr.setNodeAttribute(personNode.pos, 'mandatee', mandatee);
      return tr.setNodeAttribute(personNode.pos, 'content', mandatee.mandateeUri);
    });
    this.closeModal();
  }
}
