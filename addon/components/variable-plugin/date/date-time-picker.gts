import Component from '@glimmer/component';
import { service } from '@ember/service';
import { localCopy } from 'tracked-toolbox';
import Intl from 'ember-intl/services/intl';

import DatePicker from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/date-picker';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import TimePicker from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/time-picker';

type Sig = {
  Args: {
    value?: Date | null;
    onlyDate?: boolean;
    showSeconds?: boolean;

    onChange: (date: Date) => void;
  };
  Blocks: {
    default: [];
  };
};

export default class DateTimePickerComponent extends Component<Sig> {
  @service declare intl: Intl;
  @localCopy('args.value') declare date?: Date;

  <template>
    <AuFormRow>
      <DatePicker @onChange={{@onChange}} @value={{this.date}} />
    </AuFormRow>
    {{yield}}
    {{#unless @onlyDate}}
      <AuFormRow>
        <TimePicker
          @showSeconds={{@showSeconds}}
          @onChange={{@onChange}}
          @value={{this.date}}
        />
      </AuFormRow>
    {{/unless}}
  </template>
}
