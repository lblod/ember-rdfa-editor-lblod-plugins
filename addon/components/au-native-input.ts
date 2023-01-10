import Component from '@glimmer/component';

interface Args {
  width?: 'block';
  iconAlignment?: 'left' | 'right';
  error?: boolean;
  warning?: boolean;
  disabled?: boolean;
  type?: string;
  icon?: string;
}

export default class AuNativeInput extends Component<Args> {
  constructor(owner: unknown, args: Args) {
    super(owner, args);
  }

  get width() {
    if (this.args.width == 'block') return 'au-c-input--block';
    else return '';
  }

  get iconAlignment() {
    if (this.args.iconAlignment == 'left') return 'au-c-input-wrapper--left';
    if (this.args.iconAlignment == 'right') return 'au-c-input-wrapper--right';
    else return '';
  }

  get error() {
    if (this.args.error) return 'au-c-input--error';
    else return '';
  }

  get warning() {
    if (this.args.warning) return 'au-c-input--warning';
    else return '';
  }

  get disabled() {
    if (this.args.disabled) return 'is-disabled';
    else return '';
  }

  get type() {
    return this.args.type || 'text';
  }
}
