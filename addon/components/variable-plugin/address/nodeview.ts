import Component from '@glimmer/component';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';

import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/address-helpers';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  controller: SayController;
};

export default class AddressNodeviewComponent extends Component<Args> {
  PencilIcon = PencilIcon;

  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get translations() {
    return {
      placeholder: this.intl.t('editor-plugins.address.nodeview.placeholder', {
        locale: this.documentLanguage,
      }),
    };
  }

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
}
