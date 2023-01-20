import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

type Args = {
  alignment: 'left' | 'right';
  icon: string;
  iconAlignment: 'left' | 'right';
  skin?: string;
};
export default class AuDropdownPill extends Component<Args> {
  @tracked dropdownOpen = false;

  @action
  openDropdown() {
    this.dropdownOpen = true;
  }

  @action
  closeDropdown() {
    this.dropdownOpen = false;
  }

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @action
  clickOutsideDeactivates(event: InputEvent) {
    const toggleButton = document.querySelector('[data-au-dropdown-toggle]');
    const isClosedByToggleButton = toggleButton?.contains(
      event.target as HTMLInputElement
    );

    if (!isClosedByToggleButton) {
      this.closeDropdown();
    }

    return true;
  }

  // Dropdown alignment
  get alignment() {
    if (this.args.alignment == 'left') return 'au-c-dropdown__menu--left';
    if (this.args.alignment == 'right') return 'au-c-dropdown__menu--right';
    return '';
  }

  get skin() {
    return this.args.skin || 'default';
  }

  // Set default button icon
  get icon() {
    if (this.args.icon) return this.args.icon;
    else return 'chevron-down';
  }

  // Set default icon alignment
  get iconAlignment() {
    if (this.args.iconAlignment) return this.args.iconAlignment;
    else return 'right';
  }
}
