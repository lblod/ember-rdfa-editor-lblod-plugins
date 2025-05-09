import { hash } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { FunctionBasedModifier, modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { Signature as VelcroModifierSignature } from 'ember-velcro/modifiers/velcro';
import { ModifierLike } from '@glint/template';
export type Placement = VelcroModifierSignature['Args']['Named']['placement'];

interface HoverModifierSig {
  Element: HTMLElement;
}
interface Sig {
  Args: { placement?: Placement };
  Blocks: {
    hover: [
      hover: {
        velcroHook: ModifierLike<Velcro['velcroHook']>;
        handleHover: ModifierLike<FunctionBasedModifier<HoverModifierSig>>;
      },
    ];
    tooltip: [loop: ModifierLike<Velcro['velcroLoop']>];
  };
}

export default class HoverTooltip extends Component<Sig> {
  hover = modifier<HoverModifierSig>((element) => {
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
  });
  @tracked tooltipOpen = false;

  get placement(): Placement | undefined {
    return this.args.placement ?? 'top';
  }

  showTooltip = () => {
    this.tooltipOpen = true;
  };

  hideTooltip = () => {
    this.tooltipOpen = false;
  };
  <template>
    <Velcro @placement={{this.placement}} @strategy='absolute' as |velcro|>
      {{#let velcro.loop as |loop|}}
        {{yield
          (hash velcroHook=velcro.hook handleHover=this.hover)
          to='hover'
        }}
        {{#if this.tooltipOpen}}
          {{yield loop to='tooltip'}}
        {{/if}}
      {{/let}}
    </Velcro>
  </template>
}
