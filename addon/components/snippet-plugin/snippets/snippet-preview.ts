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
  onInsert: (content: string) => void;
}

export default class SnippetPreviewComponent extends Component<Args> {
  @tracked controller?: SayController;

  get snippet(): Snippet {
    return this.args.snippet;
  }

  @action
  rdfaEditorInit(controller: SayController) {
    this.controller = controller;

    const presetContent: string = this.args.snippet.content?.toHTML() ?? '';

    controller.setHtmlContent(presetContent, { shouldFocus: false });
    controller.mainEditorView.setProps({ editable: () => false });
  }

  @action
  onInsert() {
    this.args.onInsert(this.args.snippet.content?.toHTML() ?? '');
  }
}
