import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { capitalize } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import {
  isBesluitType,
  LEGISLATION_TYPE_CONCEPTS,
  LEGISLATION_TYPES,
  legislationKeysCapitalized,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/types';
import { CitationPluginEmberComponentConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import IntlService from 'ember-intl/services/intl';
import {
  Option,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { Article } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/article';
import {
  fetchLegalDocuments,
  LegalDocument,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';

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
  selectedDecision: LegalDocument;
  legislationTypeUri: string;
  text: string;
  insertDecisionCitation: (decision: LegalDocument) => void;
  insertArticleCitation: (decision: LegalDocument, article: Article) => void;
  closeModal: (legislationTypeUri?: string, text?: string) => void;
  config: CitationPluginEmberComponentConfig;
}

export default class EditorPluginsCitationsSearchModalComponent extends Component<Args> {
  @service declare intl: IntlService;
  // Vlaamse Codex currently doesn't contain captions and content of decisions
  // @tracked isEnabledSearchCaption = false
  // @tracked isEnabledSearchContent = false
  @tracked pageNumber = 0;
  @tracked pageSize = 5;
  @tracked totalCount = 0;
  @tracked decisions = [];
  @tracked error: unknown;
  @tracked selectedDecision: LegalDocument | null = null;
  @tracked documentDateFrom: Date | null = null;
  @tracked documentDateTo: Date | null = null;
  @tracked publicationDateFrom: Date | null = null;
  @tracked publicationDateTo: Date | null = null;
  @tracked inputSearchText: string | null = null;
  minDate = new Date('1930-01-01T12:00:00');
  maxDate = new Date(`${new Date().getFullYear() + 10}-01-01T12:00:00`);

  get legislationTypeUri() {
    return this.args.legislationTypeUri || LEGISLATION_TYPES['decreet'];
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
    if (this.config.decisionsEndpoint) {
      return legislationKeysCapitalized;
    }

    return legislationKeysCapitalized.filter((key) => key !== 'Besluit');
  }

  get legislationSelected() {
    const found = LEGISLATION_TYPE_CONCEPTS.find(
      (c) => c.value === this.legislationTypeUri,
    );
    return capitalize(
      found ? found.label : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).label,
    );
  }

  get text() {
    return this.args.text;
  }

  get config() {
    return this.args.config;
  }

  get searchText() {
    return this.inputSearchText ?? this.text;
  }

  resourceSearch = restartableTask(async () => {
    await timeout(500);
    this.error = null;
    const abortController = new AbortController();
    try {
      // Split search string by grouping on non-whitespace characters
      // This probably needs to be more complex to search on group of words
      const words = this.searchText.match(/\S+/g) || [];
      const filter = {
        type: this.legislationTypeUri,
        documentDateFrom: getISODate(this.documentDateFrom),
        documentDateTo: getISODate(this.documentDateTo),
        publicationDateFrom: getISODate(this.publicationDateFrom),
        publicationDateTo: getISODate(this.publicationDateTo),
      };
      const results = await fetchLegalDocuments({
        words: words,
        filter: filter,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        config: this.args.config,
      });
      this.totalCount = results.totalCount;
      return results.legalDocuments;
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
    this.searchText,
    this.legislationTypeUri,
    this.pageSize,
    this.pageNumber,
    this.documentDateFrom,
    this.documentDateTo,
    this.publicationDateFrom,
    this.publicationDateTo,
  ]);

  get isBesluitType() {
    return isBesluitType(this.legislationTypeUri);
  }

  @action
  setInputSearchText(event: InputEvent) {
    this.inputSearchText = (event.target as HTMLInputElement).value;
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
  async insertDecisionCitation(decision: LegalDocument) {
    this.args.insertDecisionCitation(decision);
    await this.closeModal();
  }

  @action
  async insertArticleCitation(decision: LegalDocument, article: Article) {
    this.args.insertArticleCitation(decision, article);
    await this.closeModal();
  }

  @action
  async closeModal(legislationTypeUri?: string, text?: string) {
    await this.decisionResource.cancel();
    this.inputSearchText = null;
    this.args.closeModal(legislationTypeUri, text);
  }

  @action
  openDecisionDetail(decision: LegalDocument) {
    this.selectedDecision = decision;
  }

  @action
  closeDecisionDetail() {
    this.selectedDecision = null;
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
}

function getLocalizedMonths(
  intl: IntlService,
  monthFormat: Intl.DateTimeFormatOptions['month'] = 'long',
) {
  const someYear = 2021;
  return [...Array(12).keys()].map((monthIndex) => {
    const date = new Date(someYear, monthIndex);
    return intl.formatDate(date, { month: monthFormat });
  });
}

function getLocalizedDays(
  intl: IntlService,
  weekdayFormat: Intl.DateTimeFormatOptions['weekday'] = 'long',
) {
  const someSunday = new Date('2021-01-03');
  return [...Array(7).keys()].map((index) => {
    const weekday = new Date(someSunday.getTime());
    weekday.setDate(someSunday.getDate() + index);
    return intl.formatDate(weekday, { weekday: weekdayFormat });
  });
}
