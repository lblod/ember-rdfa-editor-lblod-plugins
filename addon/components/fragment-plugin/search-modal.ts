import { assert } from '@ember/debug';
import { action } from '@ember/object';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface Args {
  config: { endpoint: string };
  closeModal: () => void;
}

export default class FragmentPluginSearchModalComponent extends Component<Args> {
  @tracked inputSearchText: string | null = null;

  @action
  setInputSearchText(event: InputEvent) {
    assert(
      'inputSearchText must be bound to an input element',
      event.target instanceof HTMLInputElement
    );

    this.inputSearchText = event.target.value;
  }

  @action
  closeModal() {
    this.args.closeModal();
  }
}
