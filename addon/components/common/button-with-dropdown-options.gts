import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import Component from '@glimmer/component';

export default class ButtonWithDropdownOptions extends Component {
  <template>
    <AuButtonGroup>
      <AuButton ...attributes>{{yield to='primaryButton'}}</AuButton>
      <AuDropdown @alignment='left' @skin='primary' @icon='chevron-down'>
        {{yield to='dropdown'}}
      </AuDropdown>
    </AuButtonGroup>
  </template>
}
