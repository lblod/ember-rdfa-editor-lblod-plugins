import Component from '@glimmer/component';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { PNode } from '@lblod/ember-rdfa-editor';

interface Sig {
  Args: {
    node: PNode;
  };
  Blocks: {
    default: [];
  };
}

export default class BlockLockedPlaceholder extends Component<Sig> {
  get label() {
    return this.args.node.attrs.label;
  }
  <template>
    <AuAlert class='say-block-locked-placeholder'>
      {{this.label}}
    </AuAlert>
  </template>
}
