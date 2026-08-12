import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';
import { getPromiseState, State } from 'reactiveweb/get-promise-state';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
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

  // Filtering
  @tracked inputSearchText: string | null = null;

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

  get snippetListNames() {
    return this.args.snippetListNames.resolved
      ?.map((name) => `"${name}"`)
      .join(', ');
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
  async closeModal() {
    await this.snippetsResource.cancel();
    this.args.closeModal();
  }

  snippetsSearch = restartableTask(async () => {
    if (this.searchText) {
      await timeout(500);
    }

    const abortController = new AbortController();

    try {
      const queryResult = await this.snippetFetchService.getSnippets({
        endpoint: this.args.config.endpoint,
        abortSignal: abortController.signal,
        filter: {
          name: this.inputSearchText ?? undefined,
          snippetListUris: this.args.snippetListUris ?? undefined,
        },
        pagination: {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
        },
      });

      this.totalCount = queryResult.totalCount;

      return queryResult.results;
    } catch (error) {
      this.error = error;
      return [];
    } finally {
      abortController.abort();
    }
  });

  snippetsResource = trackedTask<Snippet[]>(this, this.snippetsSearch, () => [
    this.inputSearchText,
    this.pageNumber,
    this.pageSize,
    this.args.snippetListUris,
  ]);
  snippets = getPromiseState(async () => this.snippetsResource);

  @action
  previousPage() {
    --this.pageNumber;
  }

  @action
  nextPage() {
    ++this.pageNumber;
  }

  <template>
    <AuModal
      class='snippet-modal'
      @modalOpen={{@open}}
      @closeModal={{this.closeModal}}
      @title={{t
        'snippet-plugin.modal.title'
        snippetListNames=this.snippetListNames
      }}
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
            <div class='au-u-padding-top snippet-modal--list-container'>
              {{#if this.snippets.isLoading}}
                <div class='au-u-margin'>
                  <Loading />
                </div>
              {{else}}
                {{#if this.snippets.error}}
                  <AlertLoadError @error={{this.snippets.error}} />
                {{else}}
                  {{#if this.snippets.resolved.length}}
                    <PreviewList
                      @docs={{this.snippets.resolved}}
                      @onInsert={{@onInsert}}
                    />
                  {{else}}
                    <AlertNoItems />
                  {{/if}}
                {{/if}}
              {{/if}}
            </div>
            {{#if this.snippets.resolved.length}}
              {{#let
                (pagination
                  page=this.pageNumber
                  pageSize=this.pageSize
                  count=this.totalCount
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
