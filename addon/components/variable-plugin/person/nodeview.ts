import Component from '@glimmer/component';

import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { FOAF } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

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

  get firstName() {
    const firstName = getOutgoingTriple(this.node.attrs, FOAF('givenName'))
      ?.object.value;
    return firstName;
  }

  get lastName() {
    const lastName = getOutgoingTriple(this.node.attrs, FOAF('familyName'))
      ?.object.value;
    return lastName;
  }

  get filled() {
    return Boolean(this.firstName) || Boolean(this.lastName);
  }

  get content() {
    const fullName = [this.firstName, this.lastName].filter(Boolean).join(' ');
    return fullName || this.node.attrs['label'];
  }
}
