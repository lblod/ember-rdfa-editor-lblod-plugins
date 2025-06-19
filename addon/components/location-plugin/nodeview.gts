import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import IntlService from 'ember-intl/services/intl';
import AuPill, {
  type AuPillSignature,
} from '@appuniversum/ember-appuniversum/components/au-pill';

import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/utils/address-helpers';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

type Signature = {
  Args: {
    selectNode: () => void;
    getPos: () => number | undefined;
    node: PNode;
    controller: SayController;
  };
  Element: AuPillSignature['Element'];
};

export default class AddressNodeviewComponent extends Component<Signature> {
  @service declare intl: IntlService;

  get address() {
    return this.args.node.attrs.value as Address | null;
  }

  get label() {
    if (this.address) return '';
    return getOutgoingTriple(this.args.node.attrs, EXT('label'))?.object.value;
  }

  get filled() {
    return !!this.address;
  }

  get content() {
    if (this.filled) {
      return this.address?.formatted;
    } else {
      return this.label ?? this.intl.t('location-plugin.nodeview.placeholder');
    }
  }

  <template>
    <AuPill class='say-pill atomic' ...attributes {{on 'click' @selectNode}}>
      <span class='{{unless this.filled "unfilled-variable"}}'>
        {{this.content}}
      </span>
    </AuPill>
  </template>
}
