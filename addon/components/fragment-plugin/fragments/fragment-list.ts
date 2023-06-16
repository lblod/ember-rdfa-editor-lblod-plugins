import Component from '@glimmer/component';

import { SayController } from '@lblod/ember-rdfa-editor';
import { FragmentPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/fragment-plugin';

interface Args {
  controller: SayController;
  config: FragmentPluginConfig;
}

export default class FragmentListComponent extends Component<Args> {
  get config() {
    return this.args.config;
  }
}
