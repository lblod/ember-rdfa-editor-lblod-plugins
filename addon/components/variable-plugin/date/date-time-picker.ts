import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { localCopy } from 'tracked-toolbox';
import Intl from 'ember-intl/services/intl';

type Args = {
  value?: Date;
  onChange: (date: Date) => void;
};

export default class DateTimePickerComponent extends Component<Args> {
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
  onChangeDate(_isoDate: unknown, date: Date) {
    const wasDateInputCleared = !date;
    if (!wasDateInputCleared) {
      if (!this.date) {
        this.date = new Date();
        this.date.setHours(0, 0, 0, 0);
      }
      this.date.setFullYear(date.getFullYear());
      this.date.setMonth(date.getMonth());
      this.date.setDate(date.getDate());
      this.args.onChange(this.date);
    }
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
}
