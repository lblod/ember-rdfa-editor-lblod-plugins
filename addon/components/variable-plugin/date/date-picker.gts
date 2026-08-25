import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { localCopy } from 'tracked-toolbox';
import Intl from 'ember-intl/services/intl';

import AuDatePicker from '@appuniversum/ember-appuniversum/components/au-date-picker';
import t from 'ember-intl/helpers/t';

type Sig = {
  Args: {
    value?: Date | null;
    onChange: (date: Date) => void;
  };
};

export default class DatePickerComponent extends Component<Sig> {
  @service declare intl: Intl;
  @localCopy('args.value') declare date?: Date;

  get datePickerLocalization() {
    return {
      buttonLabel: this.intl.t('au-date-picker.button-label'),
      selectedDateMessage: this.intl.t('au-date-picker.selected-date-message'),
      prevMonthLabel: this.intl.t('au-date-picker.prev-month-label'),
      nextMonthLabel: this.intl.t('au-date-picker.next-month-label'),
      monthSelectLabel: this.intl.t('au-date-picker.month-select-label'),
      yearSelectLabel: this.intl.t('au-date-picker.year-select-label'),
      closeLabel: this.intl.t('au-date-picker.close-label'),
      calendarHeading: this.intl.t('au-date-picker.calendar-heading'),
      dayNames: getLocalizedDays(this.intl),
      monthNames: getLocalizedMonths(this.intl),
      monthNamesShort: getLocalizedMonths(this.intl, 'short'),
      placeholder: this.intl.t('au-date-picker.placeholder'),
      locale: this.intl.primaryLocale ?? 'nl-BE',
    };
  }

  @action
  onChangeDate(_isoDate: unknown | null, date: Date | null) {
    if (!date) return;

    if (!this.date) {
      this.date = new Date();
      this.date.setHours(0, 0, 0, 0);
    }
    this.date.setFullYear(date.getFullYear());
    this.date.setMonth(date.getMonth());
    this.date.setDate(date.getDate());
    this.args.onChange(this.date);
  }

  <template>
    <AuDatePicker
      @onChange={{this.onChangeDate}}
      @value={{this.date}}
      @label={{t 'date-plugin.card.label'}}
      @localization={{this.datePickerLocalization}}
    />
  </template>
}

type MonthNames = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];
type DayNames = [string, string, string, string, string, string, string];
function getLocalizedMonths(
  intl: Intl,
  monthFormat: 'long' | 'numeric' | '2-digit' | 'short' | 'narrow' = 'long',
) {
  const someYear = 2021;
  return [...Array(12).keys()].map((monthIndex) => {
    const date = new Date(someYear, monthIndex);
    return intl.formatDate(date, { month: monthFormat });
  }) as MonthNames;
}

function getLocalizedDays(
  intl: Intl,
  weekdayFormat: 'long' | 'short' | 'narrow' = 'long',
): DayNames {
  const someSunday = new Date('2021-01-03');
  return [...Array(7).keys()].map((index) => {
    const weekday = new Date(someSunday.getTime());
    weekday.setDate(someSunday.getDate() + index);
    return intl.formatDate(weekday, { weekday: weekdayFormat });
  }) as DayNames;
}
