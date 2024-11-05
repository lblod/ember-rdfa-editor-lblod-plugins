import Component from '@glimmer/component';
import { PlusTextIcon } from '@appuniversum/ember-appuniversum/components/icons/plus-text';
import { type EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import SearchModal from '../search-modal';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { ProseParser, Slice } from '@lblod/ember-rdfa-editor';
import insertSnippet from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/commands/insert-snippet';
import {
  getAssignedSnippetListsIdsFromProperties,
  getSnippetListIdsProperties,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/rdfa-predicate';
import t from 'ember-intl/helpers/t';

interface Signature {
  Args: Pick<EmberNodeArgs, 'node' | 'selectNode'>;
}

export default class SnippetPluginPlaceholder extends Component<Signature> {
  @service declare intl: IntlService;

  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  get snippetListIds() {
    const activeNodeSnippetListIds = getSnippetListIdsProperties(this.node);
    return getAssignedSnippetListsIdsFromProperties(activeNodeSnippetListIds);
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
  onInsert(content: string, title: string) {
    this.closeModal();
    this.controller.doCommand(
      insertSnippet({
        content,
        title,
        assignedSnippetListsIds: this.snippetListIds,
        importedResources: this.node.attrs.importedResources,
        allowMultipleSnippets: this.node.attrs.allowMultipleSnippets,
      }),
    );
  }

  get listNames() {
    return this.args.node.attrs.snippetListNames;
  }
  get isSingleList() {
    return this.listNames.length === 1;
  }
  get alertTitle() {
    if (this.isSingleList) {
      return this.intl.t('snippet-plugin.placeholder.title-single', {
        listName: this.listNames[0],
      });
    } else {
      return this.intl.t('snippet-plugin.placeholder.title-multiple');
    }
  }
  <template>
    <div class='say-snippet-placeholder' {{on 'click' @selectNode}}>
      <div class='say-snippet-placeholder__icon'>
        <AuIcon @icon={{PlusTextIcon}} />
      </div>
      <div class='say-snippet-placeholder__content'>
        <p class='say-snippet-placeholder__title'>{{this.alertTitle}}</p>
        {{#unless this.isSingleList}}
          <ul class='say-snippet-placeholder__list'>
            {{#each this.listNames as |listName|}}
              <li>{{listName}}</li>
            {{/each}}
          </ul>
        {{/unless}}
        {{#if this.node.attrs.config.showInsertButton}}
          <AuButton
            @skin='link'
            class='say-snippet-placeholder__button'
            {{on 'click' this.openModal}}
          >
            {{t 'snippet-plugin.placeholder.button'}}
          </AuButton>
        {{/if}}
      </div>
    </div>
    <SearchModal
      @open={{this.showModal}}
      @closeModal={{this.closeModal}}
      @config={{this.node.attrs.config}}
      @onInsert={{this.onInsert}}
      @assignedSnippetListsIds={{this.snippetListIds}}
    />
  </template>
}
