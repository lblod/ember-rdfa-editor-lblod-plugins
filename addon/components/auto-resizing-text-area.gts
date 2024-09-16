import Component from '@glimmer/component';
import { action } from '@ember/object';
import AuTextarea, {
  AuTextareaSignature,
} from '@appuniversum/ember-appuniversum/components/au-textarea';
import { modifier } from 'ember-modifier';

interface Sig {
  Args: { maxHeight?: number } & AuTextareaSignature['Args'];
  Blocks: {
    default: [];
  };
  Element: HTMLTextAreaElement;
}

export default class AutoResizingTextArea extends Component<Sig> {
  setupAutoResize = modifier((element: HTMLTextAreaElement) => {
    const resize = () => {
      element.style.setProperty('height', '');
      const height = this.args.maxHeight
        ? Math.min(element.scrollHeight, this.args.maxHeight)
        : element.scrollHeight;
      element.style.setProperty('height', `${height}px`);
    };
    element.addEventListener('input', resize);
    resize();
    return () => element.removeEventListener('input', resize);
  });

  @action
  onInput() {}

  <template>
    <AuTextarea
      {{this.setupAutoResize}}
      @width={{@width}}
      @disabled={{@disabled}}
      @error={{@error}}
      @warning={{@warning}}
      ...attributes
    >{{yield}}</AuTextarea>
  </template>
}
