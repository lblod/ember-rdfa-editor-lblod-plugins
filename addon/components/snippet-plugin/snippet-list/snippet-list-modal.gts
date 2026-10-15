import Component from '@glimmer/component';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';

import { tracked } from '@glimmer/tracking';

import {
  fetchSnippetLists,
  OrderBy,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';

import {
  SnippetPluginConfig,
  SnippetList,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { localCopy, trackedReset } from 'tracked-toolbox';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import t from 'ember-intl/helpers/t';
import AuMainContainer from '@appuniversum/ember-appuniversum/components/au-main-container';
import AlertLoadError from '../../common/search/alert-load-error';
import SnippetListView from './snippet-list-view';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';

interface Signature {
  Args: {
    config: SnippetPluginConfig;
    onSaveSnippetLists: (
      lists: SnippetList[],
      allowMultipleSnippets: boolean,
    ) => void;
    snippetListUris: string[] | undefined;
    closeModal: () => void;
    open: boolean;
    allowMultipleSnippets?: boolean;
  };
}

export default class SnippetListModalComponent extends Component<Signature> {
  // Filtering
  @tracked nameFilterText: string | null = null;

  // Sorting
  @tracked sort: OrderBy = null;

  // Display
  @tracked error: unknown;

  @trackedReset('args.snippetListUris')
  snippetListUris: string[] = [...(this.args.snippetListUris ?? [])];

  @localCopy('args.allowMultipleSnippets') allowMultipleSnippets = false;

  @action
  handleMultipleSnippetsCheckbox(checked: boolean) {
    this.allowMultipleSnippets = checked;
  }

  get config() {
    return this.args.config;
  }

  @action
  closeModal() {
    this.allowMultipleSnippets = this.args.allowMultipleSnippets ?? false;
    this.args.closeModal();
  }

  @action
  saveAndClose() {
    const snippetLists = this.snippetListResource.value?.filter((snippetList) =>
      this.snippetListUris.includes(snippetList.uri),
    );
    this.args.onSaveSnippetLists(
      snippetLists || [],
      this.allowMultipleSnippets,
    );
    this.args.closeModal();
    // Clear selection for next time
    this.snippetListUris = [];
  }

  snippetListSearch = restartableTask(async () => {
    await timeout(500);

    const abortController = new AbortController();

    try {
      const queryResult = await fetchSnippetLists({
        endpoint: this.args.config.endpoint,
        abortSignal: abortController.signal,
        filter: {
          name: this.nameFilterText ?? undefined,
        },
        orderBy: this.sort,
      });

      return queryResult.results;
    } catch (error) {
      this.error = error;
      return [];
    } finally {
      abortController.abort();
    }
  });

  snippetListResource = trackedTask<SnippetList[]>(
    this,
    this.snippetListSearch,
    () => [this.nameFilterText, this.sort],
  );

  @action
  onChange(snippetListUris: string[]) {
    this.snippetListUris = snippetListUris;
  }

  <template>
    <AuModal
      @modalOpen={{@open}}
      @closeModal={{this.closeModal}}
      @title={{t 'snippet-plugin.snippet-list.modal.title'}}
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
                <SnippetListView
                  @snippetLists={{this.snippetListResource.value}}
                  @snippetListUris={{this.snippetListUris}}
                  @listNameFilter={{this.nameFilterText}}
                  @sort={{this.sort}}
                  @onChange={{this.onChange}}
                  @isLoading={{this.snippetListResource.isRunning}}
                />
              {{/if}}
            </div>
            <AuToolbar
              @border='top'
              @size='large'
              @nowrap={{true}}
              class='au-u-flex--vertical-center'
              as |Group|
            >
              <Group>
                <AuCheckbox
                  @checked={{this.allowMultipleSnippets}}
                  @onChange={{this.handleMultipleSnippetsCheckbox}}
                >
                  {{t 'snippet-plugin.snippet-list.modal.multi-snippet-toggle'}}
                </AuCheckbox>
              </Group>
              <Group>
                <AuButtonGroup>
                  <AuButton @skin='secondary' {{on 'click' this.closeModal}}>
                    {{t 'snippet-plugin.snippet-list.modal.button.cancel'}}
                  </AuButton>
                  <AuButton @skin='primary' {{on 'click' this.saveAndClose}}>
                    {{t 'snippet-plugin.snippet-list.modal.button.update'}}
                  </AuButton>
                </AuButtonGroup>
              </Group>
            </AuToolbar>
          </mc.content>
        </AuMainContainer>
      </modal.Body>
    </AuModal>
  </template>
}
