import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { localCopy } from 'tracked-toolbox';
import Intl from 'ember-intl/services/intl';

import AuTimePicker from '@appuniversum/ember-appuniversum/components/au-time-picker';
import t from 'ember-intl/helpers/t';

type Sig = {
  Args: {
    value?: Date | null;
    showSeconds?: boolean;
    onChange: (date: Date) => void;
  };
};

export default class TimePickerComponent extends Component<Sig> {
  @service declare intl: Intl;
  @localCopy('args.value') declare date?: Date;

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

  get hours() {
    return this.date?.getHours();
  }

  get minutes() {
    return this.date?.getMinutes();
  }

  get seconds() {
    return this.date?.getSeconds();
  }

  <template>
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
  </template>
}
