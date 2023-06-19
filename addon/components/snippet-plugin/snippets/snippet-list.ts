import Component from '@glimmer/component';

import { SayController } from '@lblod/ember-rdfa-editor';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Args {
  controller: SayController;
  config: SnippetPluginConfig;
}

export default class SnippetListComponent extends Component<Args> {
  get config() {
    return this.args.config;
  }
}
