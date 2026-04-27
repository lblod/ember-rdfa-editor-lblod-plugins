import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import { TOC } from '@ember/component/template-only';

type Signature = {
  Blocks: {
    primaryButton: [];
    dropdown: [];
  };
};

const ButtonWithDropdownOptions: TOC<Signature> = <template>
  <div class='button-with-dropdown'>
    <div id='button-with-dropdown--primary'>
      {{yield to='primaryButton'}}
    </div>
    <div id='button-with-dropdown--divider' />
    <AuDropdown
      id='button-with-dropdown--dropdown'
      @title=''
      @hideText={{true}}
      @alignment='left'
      role='menu'
      @skin='primary'
      @icon='chevron-down'
    >
      {{yield to='dropdown'}}
    </AuDropdown>
  </div>
</template>;

export default ButtonWithDropdownOptions;
