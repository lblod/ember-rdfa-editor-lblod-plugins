import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { localCopy } from 'tracked-toolbox';
import Intl from 'ember-intl/services/intl';

import DatePicker from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/date-picker';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuTimePicker from '@appuniversum/ember-appuniversum/components/au-time-picker';
import t from 'ember-intl/helpers/t';

type Sig = {
  Args: {
    value?: Date;
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

  get hours() {
    return this.date?.getHours();
  }

  get minutes() {
    return this.date?.getMinutes();
  }

  get seconds() {
    return this.date?.getSeconds();
  }

  @action
  onChangeTime(timeObject: {
    hours: number;
    minutes: number;
    seconds: number;
  }) {
    if (!this.date) this.date = new Date();
    this.date.setHours(timeObject.hours);
    this.date.setMinutes(timeObject.minutes);
    this.date.setSeconds(timeObject.seconds);
    this.args.onChange(this.date);
  }

  <template>
    <AuFormRow>
      <DatePicker @onChange={{@onChange}} @value={{this.date}} />
    </AuFormRow>
    {{yield}}
    {{#unless @onlyDate}}
      <AuFormRow>
        <AuTimePicker
          @hoursLabel={{t 'date-plugin.card.hours'}}
          @minutesLabel={{t 'date-plugin.card.minutes'}}
          @secondsLabel={{t 'date-plugin.card.seconds'}}
          @nowLabel={{t 'date-plugin.card.now'}}
          @hours={{this.hours}}
          @minutes={{this.minutes}}
          @seconds={{this.seconds}}
          @showSeconds={{@showSeconds}}
          @showNow={{true}}
          @onChange={{this.onChangeTime}}
        />
      </AuFormRow>
    {{/unless}}
  </template>
}
