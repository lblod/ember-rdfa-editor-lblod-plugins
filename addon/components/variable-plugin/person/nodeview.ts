import Component from '@glimmer/component';

import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { Person } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  controller: SayController;
};

export default class PersonNodeviewComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  get person() {
    return this.node.attrs.value as Person | null;
  }

  get label() {
    if (this.person) return '';
    return getOutgoingTriple(this.node.attrs, EXT('label'))?.object.value;
  }

  get filled() {
    return !!this.person;
  }

  get content() {
    if (this.person) {
      return `${this.person.firstName} ${this.person.lastName}`;
    } else {
      return this.label;
    }
  }
}
