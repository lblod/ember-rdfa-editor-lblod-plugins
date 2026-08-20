import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { trackedFunction } from 'reactiveweb/function';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import {
  ProseParser,
  type SayController,
  Slice,
} from '@lblod/ember-rdfa-editor';
import {
  Snippet,
  SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { type SnippetListProperties } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import insertSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/commands/insert-snippet';
import SnippetFetchService from '@lblod/ember-rdfa-editor-lblod-plugins/services/snippet-fetch-service';
import SearchModal from './search-modal';

interface Sig {
  Args: {
    controller: SayController;
    config: SnippetPluginConfig;
    listProperties: SnippetListProperties | undefined;
    allowMultipleSnippets?: boolean;
  };
}

export default class SnippetInsertComponent extends Component<Sig> {
  @service declare snippetFetchService: SnippetFetchService;

  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }
  get disabled() {
    return (this.args.listProperties?.listUris.length ?? 0) === 0;
  }

  @action
  openModal() {
    this.controller.focus();
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  createSliceFromElement(element: Element) {
    return new Slice(
      ProseParser.fromSchema(this.controller.schema).parse(element, {
        preserveWhitespace: true,
      }).content,
      0,
      0,
    );
  }

  @action
  onInsert(snippet: Snippet) {
    this.closeModal();
    if (this.args.listProperties) {
      this.controller.doCommand(
        insertSnippet({
          content: snippet.content ?? '',
          title: snippet.title ?? '',
          listProperties: this.args.listProperties,
          allowMultipleSnippets: this.args.allowMultipleSnippets,
        }),
      );
    }
  }

  snippetListNames = trackedFunction(this, async () => {
    return (
      this.args.listProperties &&
      this.snippetFetchService.getListNames(
        this.args.config,
        this.args.listProperties.listUris,
      )
    );
  });

  <template>
    <li class='au-c-list__item'>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        @disabled={{this.disabled}}
        {{on 'click' this.openModal}}
      >
        {{t 'snippet-plugin.insert.title'}}
      </AuButton>
    </li>

    <SearchModal
      @open={{this.showModal}}
      @closeModal={{this.closeModal}}
      @config={{@config}}
      @onInsert={{this.onInsert}}
      @snippetListUris={{@listProperties.listUris}}
      @snippetListNames={{getPromiseState this.snippetListNames.promise}}
    />
  </template>
}
