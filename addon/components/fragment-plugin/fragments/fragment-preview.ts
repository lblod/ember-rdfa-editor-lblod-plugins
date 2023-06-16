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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.args.fragment;
  }

  @action
  rdfaEditorInit(controller: SayController) {
    this.controller = controller;

    // The fragment is typed, not sure what is happening...
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const presetContent: string = this.args.fragment.content?.toHTML() ?? '';

    controller.setHtmlContent(presetContent);
  }

  @action
  onInsert() {
    // The fragment is typed, not sure what is happening...
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    this.args.onInsert(this.args.fragment.content?.toHTML() ?? '');
  }
}
