import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';

import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
import {
  FetchMandateesArgs,
  fetchAdministrativeUnits,
  fetchElectees,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin/utils/fetchElectees';
import {
  BESTUURSPERIODES,
  BestuursperiodeLabel,
  BestuursperiodeURI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { isSome } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type { AdministrativeUnit } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin';
import { localCopy } from 'tracked-toolbox';
export type SearchSort = [keyof Electee, 'ASC' | 'DESC'] | false;

interface Args {
  config: LmbPluginConfig;
  open: boolean;
  closeModal: () => void;
  onInsert: (electee: Electee) => void;
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
  @localCopy('args.config.defaultAdminUnit')
  selectedAdministrativeUnit?: AdministrativeUnit;
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
  }

  get config() {
    return this.args.config;
  }
  selectAdminPeriod = (value: AdminPeriodOption) => {
    this.selectedAdminPeriod = value;
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
      administrativeUnit,
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
        const result = await fetchElectees({
          endpoint,
          searchString,
          page,
          pageSize,
          sort,
          period,
          administrativeUnit,
        });
        const { count, electees } = result;

        return {
          results: electees,
          totalCount: count,
        };
      } catch (err) {
        console.error('Got an error fetching electees', err);
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
      administrativeUnit: this.selectedAdministrativeUnit,
    } satisfies Partial<FetchMandateesArgs> & { open: boolean },
  ]);

  searchAdministrativeUnits = restartableTask(async (search: string) => {
    await timeout(200);
    try {
      const units = await fetchAdministrativeUnits({
        endpoint: this.config.endpoint,
        searchString: search,
        lmbPeriod: this.selectedAdminPeriod.uri,
      });

      return units;
    } catch (err) {
      // ember-power-select doesn't seem to have a way to display errors.
      console.error(
        'Error occured when searching for administrative units',
        err,
      );
      // We just re-throw to keep TS happy, ember-concurrency just swallows it.
      throw err;
    }
  });

  selectAdministrativeUnit = (administrativeUnit: AdministrativeUnit) => {
    this.selectedAdministrativeUnit = administrativeUnit;
    this.pageNumber = 0;
  };

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
  async onInsert(electee: Electee) {
    this.args.onInsert(electee);
    await this.closeModal();
  }
}
