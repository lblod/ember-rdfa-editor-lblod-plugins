import Component from '@glimmer/component';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';

interface Sig {
  Blocks: {
    default: [];
  };
}

export default class BlockLockedPlaceholder extends Component<Sig> {
  get label() {
    return this.args.node.attrs.label;
  }
  <template>
    <AuAlert>
      {{this.label}}
    </AuAlert>
  </template>
}
