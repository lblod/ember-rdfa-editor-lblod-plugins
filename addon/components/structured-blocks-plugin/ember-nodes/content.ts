import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/addon/utils/ember-node';

// eslint-disable-next-line ember/no-empty-glimmer-component-classes
export default class StructuredBlocksPluginEmberNodesContentComponent extends Component<EmberNodeArgs> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }
}
