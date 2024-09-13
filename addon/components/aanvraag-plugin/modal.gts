import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { trackedReset } from 'tracked-toolbox';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuMainContainer from '@appuniversum/ember-appuniversum/components/au-main-container';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AlertLoadError from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/search/alert-load-error';
import TableView from './table-view';
import {
  Aanvraag,
  AanvraagPluginConfig,
  AanvraagResults,
  fetchAanvragen,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/aanvraag-plugin';

interface Signature {
  Args: {
    config: AanvraagPluginConfig;
    onInsert: (aanvraag: Aanvraag) => void;
    closeModal: () => void;
    open: boolean;
  };
}

export default class AanvraagModal extends Component<Signature> {
  // Filtering
  @tracked searchText: string | null = null;

  // Display
  @tracked error: unknown;

  /**
   * Paginating the search results
   */
  @trackedReset('searchText')
  pageNumber = 0;

  get config() {
    return this.args.config;
  }

  @action
  closeModal() {
    this.args.closeModal();
  }

  searchTask = restartableTask(async () => {
    await timeout(100);
    this.error = null;
    const abortController = new AbortController();
    try {
      const results = await fetchAanvragen({
        filter: {},
        // endpoint: this.args.config.endpoint,
        // abortSignal: abortController.signal,
        // pagination: { pageNumber: this.pageNumber, pageSize: 200 },
      });

      return results;
    } catch (error) {
      this.error = error;
      return { data: [], meta: { count: 0 } };
    } finally {
      //Abort all requests now that this task has either successfully finished or has been cancelled
      abortController.abort();
    }
  });

  searchResource = trackedTask<AanvraagResults>(this, this.searchTask, () => [
    this.searchText,
    this.pageNumber,
  ]);

  @action onSearchTextChange(event: InputEvent): void {
    this.searchText = (event.target as HTMLInputElement).value;
  }

  <template>
    <AuModal
      @modalOpen={{@open}}
      @closeModal={{this.closeModal}}
      @title='Insert Aanvraag'
      @size='large'
      @padding='none'
      as |modal|
    >
      <modal.Body>
        <AuMainContainer class='snippet-modal--main-container' as |mc|>
          <mc.content @scroll={{true}}>
            <div class='snippet-modal--list-container'>
              {{#if this.error}}
                <AlertLoadError
                  @error={{this.error}}
                  class='au-u-margin-top-none'
                />
              {{else}}
                <TableView
                  @results={{this.searchResource.value}}
                  @isLoading={{this.searchResource.isRunning}}
                  @onInsert={{@onInsert}}
                  @filter={{this.searchText}}
                  @pageNumber={{this.pageNumber}}
                />
              {{/if}}
            </div>
            <AuToolbar
              @border='top'
              @size='large'
              @nowrap={{true}}
              @reverse={{true}}
            >
              <AuButtonGroup>
                <AuButton @skin='secondary' {{on 'click' this.closeModal}}>
                  {{t 'lpdc-plugin.modal.close'}}
                </AuButton>
              </AuButtonGroup>
            </AuToolbar>
          </mc.content>
        </AuMainContainer>
      </modal.Body>
    </AuModal>
  </template>
}
