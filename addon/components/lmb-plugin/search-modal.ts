import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';

import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
import {
  FetchMandateesArgs,
  fetchMandatees,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin/utils/fetchMandatees';
import {
  BESTUURSPERIODES,
  BestuursperiodeLabel,
  BestuursperiodeURI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { isSome } from '@lblod/ember-rdfa-editor/utils/_private/option';
export type SearchSort = [keyof Mandatee, 'ASC' | 'DESC'] | false;

interface Args {
  config: LmbPluginConfig;
  open: boolean;
  closeModal: () => void;
  onInsert: (mandatee: Mandatee) => void;
}
interface AdminPeriodOption {
  label: BestuursperiodeLabel;
  uri: BestuursperiodeURI;
}

export default class LmbPluginSearchModalComponent extends Component<Args> {
  // Display
  @tracked error: unknown;
  @tracked inputSearchText: string | null = null;
  @tracked sort: SearchSort = false;

  // Pagination
  @tracked pageNumber = 0;
  @tracked pageSize = 20;
  @tracked totalCount = 0;

  // Admin periods
  @tracked selectedAdminPeriod: AdminPeriodOption;
  adminPeriods: AdminPeriodOption[];
  // Admin units
  @tracked adminUnitSearch: string;
  // tracks whether the user has just typed a character
  // doesn't need to be reactive
  typing = false;
  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.adminPeriods = Object.entries(BESTUURSPERIODES).map(
      ([key, value]: [BestuursperiodeLabel, BestuursperiodeURI]) => ({
        label: key,
        uri: value,
      }),
    );
    this.selectedAdminPeriod =
      this.adminPeriods.find(
        (entry) =>
          isSome(args.config.defaultPeriod) &&
          entry.label === args.config.defaultPeriod,
      ) ?? this.adminPeriods[this.adminPeriods.length - 1];
    this.adminUnitSearch = args.config.defaultAdminUnit ?? '';
  }

  get config() {
    return this.args.config;
  }
  selectAdminPeriod = (value: AdminPeriodOption) => {
    this.selectedAdminPeriod = value;
    this.pageNumber = 0;
  };
  setAdminUnitSearch = (event: InputEvent) => {
    this.typing = true;
    assert(
      'setAdminUnitSearch must be bound to an input element',
      event.target instanceof HTMLInputElement,
    );
    this.adminUnitSearch = event.target.value;
    this.pageNumber = 0;
  };

  @action
  async closeModal() {
    this.typing = false;
    this.inputSearchText = null;
    this.sort = false;
    await this.servicesResource.cancel();
    this.args.closeModal();
  }

  // TODO Either make this a trackedFunction or do filtering on the query and correctly pass an
  // AbortController
  search = restartableTask(
    async ({
      endpoint,
      searchString,
      page,
      pageSize,
      sort,
      period,
      adminUnitSearch,
    }: FetchMandateesArgs) => {
      // debounce, but only when the input fields are being used
      if (this.typing) {
        this.typing = false;
        await timeout(250);
      }

      if (!this.args.open) {
        return {
          results: [],
          totalCount: 0,
        };
      }

      try {
        const result = await fetchMandatees({
          endpoint,
          searchString,
          page,
          pageSize,
          sort,
          period,
          adminUnitSearch,
        });
        const { count, mandatees } = result;

        return {
          results: mandatees,
          totalCount: count,
        };
      } catch (err) {
        console.error('Got an error fetching LMB data', err);
        this.error = err;
      }
      return {
        results: [],
        totalCount: 0,
      };
    },
  );

  servicesResource = trackedTask(this, this.search, () => [
    {
      endpoint: this.args.config.endpoint,
      searchString: this.inputSearchText ?? '',
      sort: this.sort,
      page: this.pageNumber,
      pageSize: this.pageSize,
      open: this.args.open,
      period: this.selectedAdminPeriod.uri,
      adminUnitSearch: this.adminUnitSearch,
    } satisfies Partial<FetchMandateesArgs> & { open: boolean },
  ]);

  @action
  setSort(sort: SearchSort) {
    this.sort = sort;
  }
  @action
  setInputSearchText(event: InputEvent) {
    assert(
      'inputSearchText must be bound to an input element',
      event.target instanceof HTMLInputElement,
    );
    this.typing = true;

    this.inputSearchText = event.target.value;
    this.pageNumber = 0;
  }
  @action
  previousPage() {
    --this.pageNumber;
  }

  @action
  nextPage() {
    ++this.pageNumber;
  }
  @action
  async onInsert(mandatee: Mandatee) {
    this.args.onInsert(mandatee);
    await this.closeModal();
  }
}
