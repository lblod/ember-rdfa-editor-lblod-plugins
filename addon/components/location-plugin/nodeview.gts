import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import IntlService from 'ember-intl/services/intl';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
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

  get translations() {
    return {
      placeholder: this.intl.t('editor-plugins.address.nodeview.placeholder', {
        locale: this.args.controller.documentLanguage,
      }),
    };
  }

  get address() {
    return this.args.node.attrs.value as Address | null;
  }

  get label() {
    if (this.address) return '';
    return getOutgoingTriple(this.args.node.attrs, EXT('label'))?.object.value;
  }

  <template>
    <AuPill
      class='variable atomic'
      @icon={{PencilIcon}}
      @iconAlignment='right'
      ...attributes
      {{on 'click' @selectNode}}
    >
      {{#if this.address}}
        {{this.address.formatted}}
      {{else}}
        <span class='mark-highlight-manual'>
          {{this.translations.placeholder}}
        </span>
      {{/if}}
      {{#if this.label}}
        <span class='label'>
          ({{this.label}})
        </span>
      {{/if}}
    </AuPill>
  </template>
}
