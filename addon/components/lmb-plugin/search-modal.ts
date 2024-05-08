import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { LmbPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin';

import { mockResponse } from './mock-response';
import Mandatee from '@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee';
type SearchSort = [keyof Mandatee, 'ASC' | 'DESC'] | false;

interface Args {
  config: LmbPluginConfig;
  open: boolean;
  closeModal: () => void;
  onInsert: () => void;
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


  get config() {
    return this.args.config;
  }

  @action
  async closeModal() {
    await this.servicesResource.cancel();
    this.args.closeModal();
  }

  fetchData = restartableTask(async () => {
    //TODO: Use real data
    const mandatees = mockResponse.results.bindings.map(Mandatee.fromBinding)
    return mandatees;
  })

  search = restartableTask(async () => {
    // TODO: This does rerun the fetchData more than once when it's not needed
    if(!this.fetchData.lastComplete) {
      await this.fetchData.perform();
    }

    await this.fetchData;

    let mandatees = this.fetchData.lastComplete?.value;
    
    if(this.inputSearchText) {
      mandatees = mandatees?.filter((mandatee: Mandatee) => mandatee.fullName.includes(this.inputSearchText as string));
    }


    if(this.sort) {
      //TODO: Solve stupid typescript errors
      mandatees = mandatees?.toSorted((a: Mandatee,b: Mandatee) => {
        if(a[this.sort[0]] > b[this.sort[0]]) {
          return this.sort[1] === 'ASC' ? 1 : -1;
        } else {
          return this.sort[1] === 'ASC' ? -1 : 1;
        }
      })
    }

    const totalCount = mandatees?.length

    mandatees = mandatees?.slice(this.pageSize * this.pageNumber, (this.pageSize * (this.pageNumber + 1)))
    return {
      results: mandatees,
      totalCount
    }
  });

  servicesResource = trackedTask(this, this.search, () => [
    this.inputSearchText, 
    this.sort, 
    this.pageNumber,
    this.pageSize
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
}
