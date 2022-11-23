import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { localCopy } from 'tracked-toolbox';

export default class RdfaDateTimePicker extends Component {
  @service intl;
  @localCopy('args.value') date;

  get hours() {
    return this.date.getHours();
  }

  get minutes() {
    return this.date.getMinutes();
  }

  get datePickerLocalization() {
    return {
      buttonLabel: this.intl.t('auDatePicker.buttonLabel'),
      selectedDateMessage: this.intl.t('auDatePicker.selectedDateMessage'),
      prevMonthLabel: this.intl.t('auDatePicker.prevMonthLabel'),
      nextMonthLabel: this.intl.t('auDatePicker.nextMonthLabel'),
      monthSelectLabel: this.intl.t('auDatePicker.monthSelectLabel'),
      yearSelectLabel: this.intl.t('auDatePicker.yearSelectLabel'),
      closeLabel: this.intl.t('auDatePicker.closeLabel'),
      keyboardInstruction: this.intl.t('auDatePicker.keyboardInstruction'),
      calendarHeading: this.intl.t('auDatePicker.calendarHeading'),
      dayNames: getLocalizedDays(this.intl),
      monthNames: getLocalizedMonths(this.intl),
      monthNamesShort: getLocalizedMonths(this.intl, 'short'),
    };
  }

  @action
  onChangeDate(isoDate, date) {
    let wasDateInputCleared = !date;
    if (!wasDateInputCleared) {
      if (!this.date) {
        this.date = new Date();
      }
      this.date.setDate(date.getDate());
      this.date.setMonth(date.getMonth());
      this.date.setFullYear(date.getFullYear());
      this.args.onChange(this.date);
    }
  }

  @action
  onChangeTime(timeObject) {
    if (!this.date) this.date = new Date();
    this.date.setHours(timeObject.hours);
    this.date.setMinutes(timeObject.minutes);
    this.args.onChange(this.date);
  }
}

function getLocalizedMonths(intl, monthFormat = 'long') {
  let someYear = 2021;
  return [...Array(12).keys()].map((monthIndex) => {
    let date = new Date(someYear, monthIndex);
    return intl.formatDate(date, { month: monthFormat });
  });
}

function getLocalizedDays(intl, weekdayFormat = 'long') {
  let someSunday = new Date('2021-01-03');
  return [...Array(7).keys()].map((index) => {
    let weekday = new Date(someSunday.getTime());
    weekday.setDate(someSunday.getDate() + index);
    return intl.formatDate(weekday, { weekday: weekdayFormat });
  });
}
