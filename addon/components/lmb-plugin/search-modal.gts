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
import AuMainContainer from '@appuniversum/ember-appuniversum/components/au-main-container';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuNativeInput from '../au-native-input';
import PowerSelect from 'ember-power-select/components/power-select';
import perform from 'ember-concurrency/helpers/perform';
import List from './list';
import pagination from '@lblod/ember-rdfa-editor-lblod-plugins/helpers/pagination';
import PaginationView from '../pagination/pagination-view';
import { not } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import AlertLoadError from '../common/search/alert-load-error';
import { on } from '@ember/modifier';
export type SearchSort = [keyof Electee, 'ASC' | 'DESC'] | false;

interface Signature {
  Args: {
    config: LmbPluginConfig;
    open: boolean;
    closeModal: () => void;
    onInsert: (electee: Electee) => void;
  };
}

interface AdminPeriodOption {
  label: BestuursperiodeLabel;
  uri: BestuursperiodeURI;
}

export default class SearchModal extends Component<Signature> {
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
  constructor(owner: unknown, args: Signature['Args']) {
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

      const abortController = new AbortController();

      try {
        const result = await fetchElectees({
          endpoint,
          searchString,
          page,
          pageSize,
          sort,
          period,
          administrativeUnit,
          abortSignal: abortController.signal,
        });
        const { count, electees } = result;

        return {
          results: electees,
          totalCount: count,
        };
      } catch (err) {
        console.error('Got an error fetching electees', err);
        this.error = err;
      } finally {
        abortController.abort();
      }
      return {
        results: [],
        totalCount: 0,
      };
    },
  );

  servicesResource = trackedTask<{ results: Electee[]; totalCount: number }>(
    this,
    this.search,
    () => [
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
    ],
  );

  searchAdministrativeUnits = restartableTask(async (search: string) => {
    await timeout(200);

    const abortController = new AbortController();
    try {
      const units = await fetchAdministrativeUnits({
        endpoint: this.config.endpoint,
        searchString: search,
        lmbPeriod: this.selectedAdminPeriod.uri,
        abortSignal: abortController.signal,
      });

      return units;
    } catch (err) {
      // ember-power-select doesn't seem to have a way to display errors.
      console.error(
        'Error occurred when searching for administrative units',
        err,
      );
      // We just re-throw to keep TS happy, ember-concurrency just swallows it.
      throw err;
    } finally {
      abortController.abort();
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
  setInputSearchText(event: Event) {
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

  <template>
    <AuModal
      class='worship-modal'
      @modalOpen={{@open}}
      @closeModal={{this.closeModal}}
      @title={{t 'lmb-plugin.modal.title'}}
      @size='large'
      @padding='none'
      as |modal|
    >
      <modal.Body>
        <AuMainContainer class='worship-modal--main-container' as |mc|>
          <mc.sidebar>
            <div class='au-c-sidebar'>
              <div class='au-c-sidebar__content au-u-padding'>
                <AuHeading
                  @level='3'
                  @skin='4'
                  class='au-u-padding-bottom-small'
                >
                  {{t 'lmb-plugin.modal.search.title'}}
                </AuHeading>
                <AuLabel class='au-margin-bottom-small' for='searchTerm'>
                  {{t 'lmb-plugin.modal.fields.name'}}
                </AuLabel>
                <AuNativeInput
                  @type='text'
                  @width='block'
                  id='searchTerm'
                  value={{this.inputSearchText}}
                  placeholder={{t 'lmb-plugin.modal.nameSearch.placeholder'}}
                  {{on 'input' this.setInputSearchText}}
                />
                <AuLabel class='au-margin-bottom-small' for='periodSelect'>
                  {{t 'lmb-plugin.modal.fields.period'}}
                </AuLabel>
                <PowerSelect
                  @allowClear={{false}}
                  @searchEnabled={{false}}
                  @options={{this.adminPeriods}}
                  @selected={{this.selectedAdminPeriod}}
                  @onChange={{this.selectAdminPeriod}}
                  as |period|
                >
                  {{period.label}}
                </PowerSelect>

                <AuLabel class='au-margin-bottom-small' for='searchAdminUnit'>
                  {{t 'lmb-plugin.modal.fields.adminUnit'}}
                </AuLabel>
                <PowerSelect
                  @allowClear={{true}}
                  @searchEnabled={{true}}
                  @search={{perform this.searchAdministrativeUnits}}
                  @selected={{this.selectedAdministrativeUnit}}
                  @onChange={{this.selectAdministrativeUnit}}
                  @loadingMessage={{t 'common.search.loading'}}
                  @placeholder={{t
                    'lmb-plugin.modal.adminUnitSearch.placeholder'
                  }}
                  @searchMessage={{t 'common.search.type-to-search'}}
                  as |unit|
                >
                  {{unit.label}}
                </PowerSelect>

              </div>
            </div>
          </mc.sidebar>
          <mc.content @scroll={{true}}>
            <div class='worship-modal--list-container'>
              {{#if this.error}}
                <AlertLoadError @error={{this.error}} />
              {{else}}
                <List
                  @services={{this.servicesResource}}
                  @sort={{this.sort}}
                  @setSort={{this.setSort}}
                  @insert={{this.onInsert}}
                />
              {{/if}}
            </div>
            {{#if this.servicesResource.value.totalCount}}
              {{#let
                (pagination
                  page=this.pageNumber
                  pageSize=this.pageSize
                  count=this.servicesResource.value.totalCount
                )
                as |pg|
              }}
                <PaginationView
                  @totalCount={{pg.count}}
                  @rangeStart={{pg.pageStart}}
                  @rangeEnd={{pg.pageEnd}}
                  @onNextPage={{this.nextPage}}
                  @onPreviousPage={{this.previousPage}}
                  @isFirstPage={{not pg.hasPreviousPage}}
                  @isLastPage={{not pg.hasNextPage}}
                />
              {{/let}}
            {{/if}}

          </mc.content>
        </AuMainContainer>
      </modal.Body>
    </AuModal>
  </template>
}
