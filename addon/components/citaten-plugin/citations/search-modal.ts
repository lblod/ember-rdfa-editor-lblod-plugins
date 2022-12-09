import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import {
  LEGISLATION_TYPE_CONCEPTS,
  LEGISLATION_TYPES,
} from '../../../utils/legislation-types';
import {
  Article,
  Decision,
  fetchDecisions,
} from '../../../plugins/citation-plugin/utils/vlaamse-codex';
import IntlService from 'ember-intl/services/intl';
import {
  Option,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

function getISODate(date: Option<Date>): string | null {
  if (date) {
    // Flatpickr captures the date in local time. Hence date.toISOString() may return the day before the selected date
    // E.g. selected date 2020-04-15 00:00:00 GMT+0200 will become 2020-04-14 22:00:00 UTC
    // We will pretend the selected date is UTC because that's what's meant as date for filtering
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  } else {
    return null;
  }
}

interface Args {
  selectedDecision: Decision;
  legislationTypeUri: string;
  text: string;
  insertDecisionCitation: (decision: Decision) => void;
  insertArticleCitation: (decision: Decision, article: Article) => void;
  closeModal: (legislationTypeUri?: string, text?: string) => void;
}

export default class EditorPluginsCitationsSearchModalComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked text: string;
  @tracked textAfterTimeout?: string;
  // Vlaamse Codex currently doesn't contain captions and content of decisions
  // @tracked isEnabledSearchCaption = false
  // @tracked isEnabledSearchContent = false
  @tracked legislationTypeUri: string;
  @tracked pageNumber = 0;
  @tracked pageSize = 5;
  @tracked totalCount = 0;
  @tracked decisions = [];
  @tracked error: unknown;
  @tracked selectedDecision: Decision | null;
  @tracked documentDateFrom: Date | null = null;
  @tracked documentDateTo: Date | null = null;
  @tracked publicationDateFrom: Date | null = null;
  @tracked publicationDateTo: Date | null = null;
  minDate = new Date('1930-01-01T12:00:00');
  maxDate = new Date(`${new Date().getFullYear() + 10}-01-01T12:00:00`);

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.selectedDecision = this.args.selectedDecision;
    this.legislationTypeUri =
      this.args.legislationTypeUri || LEGISLATION_TYPES['decreet'];
    this.text = this.args.text;
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

  get legislationTypes() {
    return Object.keys(LEGISLATION_TYPES).map(capitalize);
  }

  get legislationSelected() {
    const found = LEGISLATION_TYPE_CONCEPTS.find(
      (c) => c.value === this.legislationTypeUri
    );
    return capitalize(
      found ? found.label : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).label
    );
  }

  resourceSearch = restartableTask(async () => {
    this.error = null;
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await undefined; //To prevent retriggering because of the use of this.text later.
    const abortController = new AbortController();
    try {
      // Split search string by grouping on non-whitespace characters
      // This probably needs to be more complex to search on group of words
      const words =
        (this.textAfterTimeout || this.text || '').match(/\S+/g) || [];
      const filter = {
        type: this.legislationTypeUri,
        documentDateFrom: getISODate(this.documentDateFrom),
        documentDateTo: getISODate(this.documentDateTo),
        publicationDateFrom: getISODate(this.publicationDateFrom),
        publicationDateTo: getISODate(this.publicationDateTo),
      };
      const results = await fetchDecisions(
        words,
        filter,
        this.pageNumber,
        this.pageSize
      );
      this.totalCount = results.totalCount;
      return results.decisions;
    } catch (e) {
      console.warn(e); // eslint-ignore-line no-console
      this.totalCount = 0;
      this.error = e;
      return [];
    } finally {
      //Abort all requests now that this task has either successfully finished or has been cancelled
      abortController.abort();
    }
  });

  decisionResource = trackedTask(this, this.resourceSearch, () => [
    this.textAfterTimeout,
    this.legislationTypeUri,
    this.pageSize,
    this.pageNumber,
    this.documentDateFrom,
    this.documentDateTo,
    this.publicationDateFrom,
    this.publicationDateTo,
  ]);
  updateSearch = restartableTask(async () => {
    await timeout(500);
    this.textAfterTimeout = this.text;
    this.pageNumber = 0;
  });

  @action
  selectLegislationType(type: string) {
    type = type.toLowerCase();
    const found = LEGISLATION_TYPE_CONCEPTS.find(
      (c) => c.label.toLowerCase() === type
    );
    this.legislationTypeUri = found
      ? found.value
      : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).value;
  }

  @action
  updateDocumentDateFrom(_isoDate: unknown, date: Date) {
    this.documentDateFrom = date;
  }

  @action
  updateDocumentDateTo(_isoDate: unknown, date: Date) {
    this.documentDateTo = date;
  }

  @action
  updatePublicationDateFrom(_isoDate: unknown, date: Date) {
    this.publicationDateFrom = date;
  }

  @action
  updatePublicationDateTo(_isoDate: unknown, date: Date) {
    this.publicationDateTo = date;
  }

  @action
  async insertDecisionCitation(decision: Decision) {
    this.args.insertDecisionCitation(decision);
    await this.closeModal();
  }

  @action
  async insertArticleCitation(decision: Decision, article: Article) {
    this.args.insertArticleCitation(decision, article);
    await this.closeModal();
  }

  @action
  async closeModal(legislationTypeUri?: string, text?: string) {
    await this.decisionResource.cancel();
    this.args.closeModal(legislationTypeUri, text);
  }

  @action
  closeDecisionDetail() {
    this.selectedDecision = null;
  }

  @action
  openDecisionDetail(decision: Decision) {
    this.selectedDecision = decision;
  }

  // Pagination

  @action
  previousPage() {
    --this.pageNumber;
  }

  @action
  nextPage() {
    ++this.pageNumber;
  }

  get rangeStart() {
    return this.pageNumber * this.pageSize + 1;
  }

  get rangeEnd() {
    const end = this.rangeStart + this.pageSize - 1;
    return end > this.totalCount ? this.totalCount : end;
  }

  get isFirstPage() {
    return this.pageNumber == 0;
  }

  get isLastPage() {
    return this.rangeEnd == this.totalCount;
  }
}

function getLocalizedMonths(
  intl: IntlService,
  monthFormat: Intl.DateTimeFormatOptions['month'] = 'long'
) {
  const someYear = 2021;
  return [...Array(12).keys()].map((monthIndex) => {
    const date = new Date(someYear, monthIndex);
    return intl.formatDate(date, { month: monthFormat });
  });
}

function getLocalizedDays(
  intl: IntlService,
  weekdayFormat: Intl.DateTimeFormatOptions['weekday'] = 'long'
) {
  const someSunday = new Date('2021-01-03');
  return [...Array(7).keys()].map((index) => {
    const weekday = new Date(someSunday.getTime());
    weekday.setDate(someSunday.getDate() + index);
    return intl.formatDate(weekday, { weekday: weekdayFormat });
  });
}
