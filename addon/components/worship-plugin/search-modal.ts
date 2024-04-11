import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { WorshipPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin';
import {
  fetchWorshipServices,
  SearchSort,
  WorshipService,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin/utils/fetchWorshipServices';
import { AdministrativeUnit } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin';

interface Args {
  config: WorshipPluginConfig;
  open: boolean;
  closeModal: () => void;
  onInsert: (service: WorshipService) => void;
}

export default class WorshipPluginSearchModalComponent extends Component<Args> {
  // Filtering
  @tracked sort: SearchSort = false;
  @tracked inputSearchText: string | null = null;
  // We're deliberately using the arg to set the initial value
  // eslint-disable-next-line ember/no-tracked-properties-from-args
  @tracked administrativeUnit: AdministrativeUnit | undefined =
    this.args.config.defaultAdministrativeUnit;

  // Display
  @tracked error: unknown;

  // Pagination
  @tracked pageNumber = 0;
  @tracked pageSize = 20;
  @tracked totalCount = 0;

  get config() {
    return this.args.config;
  }

  get searchText() {
    return this.inputSearchText;
  }

  @action
  setInputSearchText(event: InputEvent) {
    assert(
      'inputSearchText must be bound to an input element',
      event.target instanceof HTMLInputElement,
    );

    this.inputSearchText = event.target.value;
  }

  @action
  setAdministrativeUnit(unit: AdministrativeUnit) {
    this.administrativeUnit = unit;
  }

  @action
  async closeModal() {
    await this.servicesResource.cancel();
    this.args.closeModal();
  }

  search = restartableTask(async () => {
    await timeout(500);

    const abortController = new AbortController();

    try {
      const queryResult = await fetchWorshipServices({
        administrativeUnitURI: this.administrativeUnit?.uri,
        config: this.args.config,
        searchMeta: {
          abortSignal: abortController.signal,
          filter: {
            label: this.inputSearchText ?? undefined,
          },
          sort: this.sort,
          page: this.pageNumber,
          pageSize: this.pageSize,
        },
      });
      this.error = undefined;

      // Reset to first page if there are no results for this one e.g. when changing search
      if (
        this.pageNumber !== 0 &&
        this.pageNumber * this.pageSize >= queryResult.totalCount
      ) {
        this.pageNumber = 0;
      }

      return queryResult;
    } catch (error) {
      this.error = error;
      return {
        results: [],
        totalCount: 0,
      };
    } finally {
      abortController.abort();
    }
  });

  servicesResource = trackedTask(this, this.search, () => [
    this.inputSearchText,
    this.administrativeUnit,
    this.pageNumber,
    this.pageSize,
    this.sort,
  ]);

  @action
  setSort(sort: SearchSort) {
    this.sort = sort;
  }

  @action
  previousPage() {
    --this.pageNumber;
  }

  @action
  nextPage() {
    ++this.pageNumber;
  }
}
