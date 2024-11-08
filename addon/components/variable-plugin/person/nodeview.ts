import Component from '@glimmer/component';

import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';

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

  get mandatee() {
    return this.node.attrs.mandatee as Mandatee | null;
  }

  get label() {
    if (this.mandatee) return '';
    return getOutgoingTriple(this.node.attrs, EXT('label'))?.object.value;
  }

  get filled() {
    return !!this.mandatee;
  }

  get content() {
    if (this.filled) {
      return this.mandatee?.fullName;
    } else {
      return this.label;
    }
  }
}
