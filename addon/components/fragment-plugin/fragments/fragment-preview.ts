import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { SayController } from '@lblod/ember-rdfa-editor';
import {
  Fragment,
  FragmentPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/fragment-plugin';

interface Args {
  config: FragmentPluginConfig;
  fragment: Fragment;
  onInsert: (content: string) => void;
}

export default class FragmentPreviewComponent extends Component<Args> {
  @tracked controller?: SayController;

  get fragment(): Fragment {
    return this.args.fragment;
  }

  @action
  rdfaEditorInit(controller: SayController) {
    this.controller = controller;

    const presetContent: string = this.args.fragment.content?.toHTML() ?? '';

    controller.setHtmlContent(presetContent, { shouldFocus: false });
    controller.mainEditorView.setProps({ editable: () => false });
  }

  @action
  onInsert() {
    this.args.onInsert(this.args.fragment.content?.toHTML() ?? '');
  }
}
