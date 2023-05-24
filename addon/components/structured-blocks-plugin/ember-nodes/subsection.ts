import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

export default class StructuredBlocksPluginEmberNodesSubsectionComponent extends Component<EmberNodeArgs> {
  get number() {
    return (this.args.node.attrs.number as number) ?? -1;
  }
}
