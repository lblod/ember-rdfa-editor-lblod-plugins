import Component from '@glimmer/component';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';

interface Sig {
  Blocks: {
    default: [];
  };
}

export default class InlineLockedPlaceholder extends Component<Sig> {
  get label() {
    return this.args.node.attrs.label;
  }
  <template>
    <AuPill class='say-pill say-inline-locked-placeholder'>
      {{this.label}}
    </AuPill>
  </template>
}
