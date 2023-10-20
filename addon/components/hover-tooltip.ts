import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { tracked } from '@glimmer/tracking';
import { Velcro } from 'ember-velcro';

interface Args {
  placement?: string;
}

export default class HoverTooltip extends Component<Args> {
  Velcro = Velcro;
  hover = modifier(
    (element) => {
      element.addEventListener('mouseenter', this.showTooltip);
      element.addEventListener('mouseleave', this.hideTooltip);
      element.addEventListener('focus', this.showTooltip);
      element.addEventListener('blur', this.hideTooltip);
      return () => {
        element.removeEventListener('mouseenter', this.showTooltip);
        element.removeEventListener('mouseleave', this.hideTooltip);
        element.removeEventListener('focus', this.showTooltip);
        element.removeEventListener('blur', this.hideTooltip);
      };
    },
    { eager: false },
  );

  @tracked tooltipOpen = false;

  get placement() {
    return this.args.placement ?? 'top';
  }

  showTooltip = () => {
    this.tooltipOpen = true;
  };

  hideTooltip = () => {
    this.tooltipOpen = false;
  };
}
