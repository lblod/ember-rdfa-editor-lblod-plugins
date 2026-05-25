import Component from '@glimmer/component';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';

interface Sig {
  Blocks: {
    default: [];
  };
}

export default class InlineLockedPlaceholder extends Component<Sig> {
  <template>
    <AuPill class='say-pill'>
      Locked placeholder
    </AuPill>
  </template>
}
