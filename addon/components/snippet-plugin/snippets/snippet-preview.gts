import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { NavDownIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-down';
import { NavUpIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-up';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { SayController } from '@lblod/ember-rdfa-editor';
import {
  Snippet,
  SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import t from 'ember-intl/helpers/t';

interface Signature {
  Args: {
    config: SnippetPluginConfig;
    snippet: Snippet;
    onInsert: (content: string, title: string) => void;
  };
  Element: HTMLDivElement;
}

export default class SnippetPreviewComponent extends Component<Signature> {
  @tracked controller?: SayController;
  @tracked isExpanded = false;

  get snippet(): Snippet {
    return this.args.snippet;
  }

  @action
  onInsert() {
    this.args.onInsert(
      this.args.snippet.content?.toHTML() ?? '',
      this.args.snippet.title ?? '',
    );
  }

  @action
  togglePreview() {
    this.isExpanded = !this.isExpanded;
  }

  <template>
    <div class='snippet-preview' ...attributes>
      <div class='snippet-preview__header'>
        <div
          role='button'
          title={{t 'snippet-plugin.modal.preview-button.title'}}
          {{on 'click' this.togglePreview}}
          {{! template-lint-disable require-presentational-children}}
        >
          <AuButton @skin='link' class='snippet-preview__toggle'>
            {{#if this.isExpanded}}
              <AuIcon @icon={{NavUpIcon}} @size='large' />
            {{else}}
              <AuIcon @icon={{NavDownIcon}} @size='large' />
            {{/if}}
          </AuButton>
          {{! template-lint-disable no-heading-inside-button}}
          <h3 class='snippet-preview__title'>
            {{@snippet.title}}
          </h3>
        </div>
        <div
          role='button'
          title={{t 'snippet-plugin.modal.select-button.title'}}
          {{on 'click' this.onInsert}}
          {{! template-lint-disable require-presentational-children}}
        >
          <AuButton class='snippet-preview__insert-button' @skin='naked'>
            {{t 'snippet-plugin.modal.select-button.label'}}
          </AuButton>
        </div>

      </div>
      {{#if this.isExpanded}}
        <div
          class='say-editor say-content rdfa-annotations rdfa-annotations-highlight rdfa-annotations-hover snippet-preview__content'
        >
          {{#if @snippet.content}}
            {{@snippet.content}}
          {{else}}
            <p class='au-u-italic'>{{t 'snippet-plugin.modal.no-content'}}</p>
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}
