import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController, PNode } from '@lblod/ember-rdfa-editor';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { tracked } from '@glimmer/tracking';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
import { Person } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/person';

type Args = {
  controller: SayController;
  config: LmbPluginConfig;
};

type PersonNode = {
  node: PNode;
  pos: number;
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
      const personNode: PersonNode = {
        node: selection.node,
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
    return !!personNode?.node.attrs.value;
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
  onInsert(electee: Electee) {
    const personNode = this.selectedPersonNode as PersonNode;
    const person: Person = {
      uri: electee.uri,
      firstName: electee.firstName,
      lastName: electee.lastName,
    };
    this.controller.withTransaction((tr) =>
      tr.setNodeAttribute(personNode.pos, 'value', person),
    );
    this.closeModal();
  }
}
