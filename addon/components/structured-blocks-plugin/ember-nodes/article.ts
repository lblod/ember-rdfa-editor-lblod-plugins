import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

export default class StructuredBlocksPluginEmberNodesArticleComponent extends Component<EmberNodeArgs> {
  get articleNumber() {
    return (this.args.node.attrs.number as number) ?? -1;
  }
}
