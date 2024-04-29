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

  get datePickerLocalization() {
    return {
      buttonLabel: this.intl.t('au-date-picker.button-label'),
      selectedDateMessage: this.intl.t('au-date-picker.selected-date-message'),
      prevMonthLabel: this.intl.t('au-date-picker.prev-month-label'),
      nextMonthLabel: this.intl.t('au-date-picker.next-month-label'),
      monthSelectLabel: this.intl.t('au-date-picker.month-select-label'),
      yearSelectLabel: this.intl.t('au-date-picker.year-select-label'),
      closeLabel: this.intl.t('au-date-picker.close-label'),
      keyboardInstruction: this.intl.t('au-date-picker.keyboard-instruction'),
      calendarHeading: this.intl.t('au-date-picker.calendar-heading'),
      dayNames: getLocalizedDays(this.intl),
      monthNames: getLocalizedMonths(this.intl),
      monthNamesShort: getLocalizedMonths(this.intl, 'short'),
      placeholder: this.intl.t('au-date-picker.placeholder'),
    };
  }

  @action
  onChangeDate(_isoDate: unknown, date: Date) {
    const wasDateInputCleared = !date;
    if (!wasDateInputCleared) {
      if (!this.date) {
        this.date = new Date();
        this.date.setHours(0, 0, 0, 0);
      }
      this.date.setDate(date.getDate());
      this.date.setMonth(date.getMonth());
      this.date.setFullYear(date.getFullYear());
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

function getLocalizedMonths(
  intl: Intl,
  monthFormat: 'long' | 'numeric' | '2-digit' | 'short' | 'narrow' = 'long',
) {
  const someYear = 2021;
  return [...Array(12).keys()].map((monthIndex) => {
    const date = new Date(someYear, monthIndex);
    return intl.formatDate(date, { month: monthFormat });
  });
}

function getLocalizedDays(
  intl: Intl,
  weekdayFormat: 'long' | 'short' | 'narrow' = 'long',
) {
  const someSunday = new Date('2021-01-03');
  return [...Array(7).keys()].map((index) => {
    const weekday = new Date(someSunday.getTime());
    weekday.setDate(someSunday.getDate() + index);
    return intl.formatDate(weekday, { weekday: weekdayFormat });
  });
}
