import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController, PNode } from '@lblod/ember-rdfa-editor';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { tracked } from '@glimmer/tracking';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';
import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import {
  addPropertyToNode,
  updateSubject,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info/utils';
import { FOAF } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

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
  onUpdate(electee: Electee) {
    const personNode = unwrap(this.selectedPersonNode);
    this.controller.withTransaction(() => {
      return transactionCombinator(this.controller.activeEditorState)([
        updateSubject({
          pos: personNode.pos,
          targetSubject: electee.uri,
          keepBacklinks: true,
          keepProperties: false,
          keepExternalTriples: true,
        }),
        addPropertyToNode({
          resource: electee.uri,
          property: {
            predicate: FOAF('givenName').full,
            object: sayDataFactory.literal(electee.firstName),
          },
        }),
        addPropertyToNode({
          resource: electee.uri,
          property: {
            predicate: FOAF('familyName').full,
            object: sayDataFactory.literal(electee.lastName),
          },
        }),
      ]).transaction;
    });
    this.closeModal();
  }
}
