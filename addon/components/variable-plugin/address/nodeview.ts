import Component from '@glimmer/component';

import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/address-helpers';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  controller: SayController;
};

/**
 * @deprecated
 */
export default class AddressNodeviewComponent extends Component<Args> {
  get node() {
    return this.args.node;
  }

  get address() {
    return this.node.attrs.value as Address | null;
  }

  get label() {
    if (this.address) return '';
    return getOutgoingTriple(this.node.attrs, EXT('label'))?.object.value;
  }

  get filled() {
    return !!this.address;
  }

  get content() {
    if (this.filled) {
      return this.address?.formatted;
    } else {
      return this.label;
    }
  }
  get class() {
    return getClassnamesFromNode(this.node);
  }
}
