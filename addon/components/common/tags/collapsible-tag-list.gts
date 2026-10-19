import Component from '@glimmer/component';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { modifier } from 'ember-modifier';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { Tag } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/common/tags/types';

type Args = {
  tags: Tag[];
};

export default class CollapsibleTagList extends Component<Args> {
  @tracked visibleCount = this.tags.length;
  @tracked isExpanded = false;

  containerElement: HTMLElement | null = null;
  resizeObserver: ResizeObserver | null = null;

  get tags() {
    return this.args.tags;
  }

  get visibleTags() {
    return this.isExpanded ? this.tags : this.tags.slice(0, this.visibleCount);
  }

  get hiddenCount() {
    return this.tags.length - this.visibleCount;
  }

  get showMorePill() {
    return !this.isExpanded && this.hiddenCount > 0;
  }

  containerModifier = modifier((element: HTMLElement) => {
    this.containerElement = element;
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.isExpanded) this.recalculate();
    });
    this.resizeObserver.observe(element);
    this.recalculate();
    return () => {
      this.resizeObserver?.disconnect();
    };
  });

  expand = () => {
    this.isExpanded = true;
  };

  collapse = () => {
    this.isExpanded = false;
    this.recalculate();
  };

  recalculate = () => {
    const container = this.containerElement;
    if (!container) return;

    const measureRow = container.querySelector('[data-measure-row]');
    if (!measureRow) return;

    const availableWidth = container.clientWidth;
    const tagEls = Array.from(
      measureRow.querySelectorAll('[data-measure-tag]'),
    );
    const moreEl = measureRow.querySelector('[data-measure-more]');
    if (!moreEl) return;

    const gap = Number.parseFloat(getComputedStyle(measureRow).columnGap) || 0;

    let total = 0;
    let fitCount = tagEls.length;

    for (let i = 0; i < tagEls.length; i++) {
      const tagWidth = (tagEls[i] as HTMLElement).getBoundingClientRect().width;
      const nextTotal = total + (i > 0 ? gap : 0) + tagWidth;

      const remainingAfterThis = tagEls.length - (i + 1);
      const moreWidth =
        remainingAfterThis > 0 ? gap + moreEl.getBoundingClientRect().width : 0;

      if (nextTotal + moreWidth > availableWidth) {
        fitCount = i;
        break;
      }

      total = nextTotal;
    }

    this.visibleCount = fitCount;
  };

  <template>
    <div
      class='say-collapsible-tag-list
        {{if this.isExpanded "say-collapsible-tag-list--expanded"}}'
      {{this.containerModifier}}
    >
      {{! hidden row used only to measure natural widths }}
      <div
        class='say-collapsible-tag-list__measure'
        data-measure-row
        aria-hidden='true'
      >
        {{#each this.tags as |tag|}}
          <span data-measure-tag>
            <AuPill class='say-collapsible-tag-list__pill'>
              {{tag.value}}
            </AuPill>
          </span>
        {{/each}}
        <span data-measure-more>
          <AuPill class='say-collapsible-tag-list__pill'>
            +{{this.tags.length}}
          </AuPill>
        </span>
      </div>
      <div class='say-collapsible-tag-list__visible'>
        {{#each this.visibleTags as |tag|}}
          <AuPill class='say-collapsible-tag-list__pill' title={{tag.value}}>
            {{tag.value}}
          </AuPill>
        {{/each}}

        {{#if this.showMorePill}}
          <AuPill
            type='button'
            class='say-collapsible-tag-list__pill say-collapsible-tag-list__more'
            {{on 'click' this.expand}}
          >
            +{{this.hiddenCount}}
          </AuPill>
        {{/if}}

        {{#if this.isExpanded}}
          <button
            type='button'
            class='au-u-muted au-u-italic say-collapsible-tag-list__less'
            {{on 'click' this.collapse}}
          >
            {{t 'common.tags.collapsible-tag-list.show-less'}}
          </button>
        {{/if}}
      </div>
    </div>
  </template>
}
