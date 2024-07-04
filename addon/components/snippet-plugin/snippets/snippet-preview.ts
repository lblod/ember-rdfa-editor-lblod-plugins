import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { SayController } from '@lblod/ember-rdfa-editor';
import {
  Snippet,
  SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Args {
  config: SnippetPluginConfig;
  snippet: Snippet;
  onInsert: (content: string, title: string) => void;
}

export default class SnippetPreviewComponent extends Component<Args> {
  @tracked controller?: SayController;

  get snippet(): Snippet {
    return this.args.snippet;
  }

  @action
  onInsert() {
    this.args.onInsert(
      this.args.snippet.content?.toHTML() ?? '',
      this.args.snippet.title ?? '',
    );
  }
}
