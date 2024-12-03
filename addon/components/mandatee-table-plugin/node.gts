import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';

import { UserIcon } from '@appuniversum/ember-appuniversum/components/icons/user';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import IntlService from 'ember-intl/services/intl';

interface Sig {
  Args: EmberNodeArgs;
  Blocks: {
    default: [];
  };
}
export default class MandateeTableNode extends Component<Sig> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get title() {
    return this.args.node.attrs.title as string | undefined;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get warning() {
    return this.intl.t('mandatee-table-plugin.node.warning', {
      locale: this.documentLanguage,
    });
  }

  <template>
    <div class='say-mandatee-table-node'>
      <div
        class='say-mandatee-table-header au-u-flex au-u-flex--row au-u-flex--vertical-center au-u-flex--spaced-tiny'
      >
        <AuIcon
          @icon={{UserIcon}}
          @size='large'
          class='au-u-margin-left-tiny au-u-margin-right-tiny'
        />
        <div>
          <h6 class='say-mandatee-table__title'>{{this.title}}</h6>
        </div>
      </div>
      <div class='say-mandatee-table-content'>
        <AuAlert
          class='say-mandatee-table__warning'
          @icon={{AlertTriangleIcon}}
          @skin='warning'
          @size='small'
        >
          {{this.warning}}
        </AuAlert>
        {{yield}}
      </div>
    </div>
  </template>
}
