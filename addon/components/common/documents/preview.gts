import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { NavDownIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-down';
import { NavUpIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-up';
import { VoteStarFilledIcon } from '@appuniversum/ember-appuniversum/components/icons/vote-star-filled';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { SayController } from '@lblod/ember-rdfa-editor';
import { PreviewableDocument } from './types';
import { VoteStarUnfilledIcon } from '../vote-star-unfilled-icon';

interface Signature<Doc extends PreviewableDocument> {
  Args: {
    doc: Doc;
    onInsert: (toInsert: Doc) => void;
    isFavourite?: (doc: Doc) => boolean;
    toggleFavourite?: (doc: Doc) => void;
  };
  Element: HTMLDivElement;
}

export default class DocumentPreview<
  Doc extends PreviewableDocument,
> extends Component<Signature<Doc>> {
  @tracked controller?: SayController;
  @tracked isExpanded = false;

  @action
  onInsert() {
    this.args.onInsert(this.args.doc);
  }

  @action
  togglePreview() {
    this.isExpanded = !this.isExpanded;
  }

  get isFavourite() {
    return this.args.isFavourite?.(this.args.doc);
  }
  toggleFavourite = (event: MouseEvent) => {
    event.stopPropagation();
    this.args.toggleFavourite?.(this.args.doc);
  };

  <template>
    <div
      class='snippet-preview {{if this.isExpanded "snippet-preview--expanded"}}'
      ...attributes
    >
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
          {{#if @isFavourite}}
            {{#if this.isFavourite}}
              <AuButton
                @skin='naked'
                @icon={{VoteStarFilledIcon}}
                {{on 'click' this.toggleFavourite}}
              />
            {{else}}
              {{! This is weird but needed to get around the stroke-width styling of svgs in au-icons }}
              <AuButton @skin='naked' {{on 'click' this.toggleFavourite}}>
                <VoteStarUnfilledIcon />
              </AuButton>
            {{/if}}
          {{/if}}
          {{! template-lint-disable no-heading-inside-button}}
          <h3 class='snippet-preview__title'>
            {{@doc.title}}
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
          {{#if @doc.content}}
            {{@doc.content}}
          {{else}}
            <p class='au-u-italic'>{{t 'snippet-plugin.modal.no-content'}}</p>
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}
