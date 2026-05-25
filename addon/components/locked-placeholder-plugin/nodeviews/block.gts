import Component from '@glimmer/component';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';

interface Sig {
  Blocks: {
    default: [];
  };
}

export default class BlockLockedPlaceholder extends Component<Sig> {
  <template>
    <AuAlert>
      Locked placeholder
    </AuAlert>
  </template>
}
