import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';
import { State } from 'reactiveweb/get-promise-state';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import IntlService from 'ember-intl/services/intl';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuMainContainer from '@appuniversum/ember-appuniversum/components/au-main-container';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';

import { Option } from '@lblod/ember-rdfa-editor/utils/option';
import pagination from '@lblod/ember-rdfa-editor-lblod-plugins/helpers/pagination';
import AuNativeInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/au-native-input';
import Loading from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/search/loading';
import AlertLoadError from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/search/alert-load-error';
import {
  Snippet,
  SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import PreviewList from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/documents/preview-list';
import AlertNoItems from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/search/alert-no-items';
import PaginationView from '@lblod/ember-rdfa-editor-lblod-plugins/components/pagination/pagination-view';
import SnippetFetchService from '@lblod/ember-rdfa-editor-lblod-plugins/services/snippet-fetch-service';

interface Args {
  config: SnippetPluginConfig;
  snippetListUris: Option<string[]>;
  snippetListNames: State<string[]>;
  closeModal: () => void;
  open: boolean;
  onInsert: (snippet: Snippet) => void;
}

export default class SnippetPluginSearchModalComponent extends Component<Args> {
  @service declare snippetFetchService: SnippetFetchService;
  @service declare intl: IntlService;

  // Filtering
  @tracked inputSearchText: string | null = null;

  get config() {
    return this.args.config;
  }

  get searchText() {
    return this.inputSearchText;
  }

  get modalTitle() {
    const listNames = this.args.snippetListNames;
    return listNames.isLoading
      ? this.intl.t('common.search.loading')
      : listNames.error
        ? this.intl.t('snippet-plugin.snippet-list.name-error')
        : this.intl.t('snippet-plugin.modal.title', {
            snippetListNames: listNames.resolved
              ?.map((name) => `"${name}"`)
              .join(', '),
          });
  }

  @action
  setInputSearchText(event: InputEvent) {
    assert(
      'inputSearchText must be bound to an input element',
      event.target instanceof HTMLInputElement,
    );

    this.inputSearchText = event.target.value;
  }

  <template>
    <AuModal
      class='snippet-modal'
      @modalOpen={{@open}}
      @closeModal={{@closeModal}}
      @title={{this.modalTitle}}
      @size='large'
      @padding='none'
      as |modal|
    >
      <modal.Body>
        <AuMainContainer class='snippet-modal--main-container' as |mc|>
          <mc.sidebar>
            <div class='au-c-sidebar'>
              <div class='au-c-sidebar__content au-u-padding'>
                <AuHeading
                  @level='3'
                  @skin='4'
                  class='au-u-padding-bottom-small'
                >
                  {{t 'snippet-plugin.modal.search.title'}}
                </AuHeading>
                <AuLabel
                  class='au-margin-bottom-small'
                  for='searchTerm'
                  @inline={{false}}
                  @required={{false}}
                  @error={{false}}
                  @warning={{false}}
                >
                  {{t 'snippet-plugin.modal.search.label'}}
                </AuLabel>
                <AuNativeInput
                  @type='text'
                  @width='block'
                  id='searchTerm'
                  value={{this.searchText}}
                  placeholder={{t 'snippet-plugin.modal.search.placeholder'}}
                  {{on 'input' this.setInputSearchText}}
                />
              </div>
            </div>
          </mc.sidebar>
          <mc.content @scroll={{true}}>
            <Inner
              @snippetListUris={{@snippetListUris}}
              @searchText={{this.inputSearchText}}
              @onInsert={{@onInsert}}
              @config={{@config}}
            />
          </mc.content>
        </AuMainContainer>
      </modal.Body>
    </AuModal>
  </template>
}

type InnerSig = {
  Args: {
    snippetListUris: Option<string[]>;
    searchText: string | null;
    onInsert: (snippet: Snippet) => void;
    config: SnippetPluginConfig;
  };
};

// Split out inner component to allow for easy re-trying of fetch errors
class Inner extends Component<InnerSig> {
  @service declare snippetFetchService: SnippetFetchService;

  // Pagination
  @tracked pageNumber = 0;
  @tracked pageSize = 20;
  @tracked totalCount = 0;

  snippetsSearch = restartableTask(async () => {
    if (this.args.searchText) {
      await timeout(500);
    }

    const abortController = new AbortController();

    try {
      const queryResult = await this.snippetFetchService.getSnippets({
        endpoint: this.args.config.endpoint,
        abortSignal: abortController.signal,
        filter: {
          name: this.args.searchText ?? undefined,
          snippetListUris: this.args.snippetListUris ?? undefined,
        },
        pagination: {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
        },
      });

      this.totalCount = queryResult.totalCount;

      return queryResult.results;
    } finally {
      abortController.abort();
    }
  });

  snippetsResource = trackedTask<Snippet[]>(this, this.snippetsSearch, () => [
    this.args.searchText,
    this.pageNumber,
    this.pageSize,
    this.args.snippetListUris,
  ]);

  @action
  previousPage() {
    --this.pageNumber;
  }

  @action
  nextPage() {
    ++this.pageNumber;
  }

  <template>
    <div class='au-u-padding-top snippet-modal--list-container'>
      {{#if this.snippetsResource.isRunning}}
        <div class='au-u-margin'>
          <Loading />
        </div>
      {{else}}
        {{#if this.snippetsResource.error}}
          <AlertLoadError @error={{this.snippetsResource.error}} />
        {{else}}
          {{#if this.snippetsResource.value.length}}
            <PreviewList
              @docs={{this.snippetsResource.value}}
              @onInsert={{@onInsert}}
            />
          {{else}}
            <AlertNoItems />
          {{/if}}
        {{/if}}
      {{/if}}
    </div>
    {{#if this.snippetsResource.value.length}}
      {{#let
        (pagination
          page=this.pageNumber pageSize=this.pageSize count=this.totalCount
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
  </template>
}
