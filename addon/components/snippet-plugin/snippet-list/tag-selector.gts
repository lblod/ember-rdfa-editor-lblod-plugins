import Component from '@glimmer/component';
import { trackedFunction } from 'reactiveweb/function';
import { service } from '@ember/service';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import { Tag } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import {
  fetchTags,
  UsedByTagResourceType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';
import t from 'ember-intl/helpers/t';

type Signature = {
  Args: {
    endpoint: string;
    onChange: (tags: Tag[]) => void;
    selectedTags?: Tag[];
    usedByResourceTypes?: UsedByTagResourceType[];
  };
  Element: HTMLElement;
};

export default class TagSelector extends Component<Signature> {
  @service declare intl: IntlService;

  @tracked searchTerm: string | null = null;

  tags = trackedFunction<Promise<Tag[]>>(this, async () => {
    return fetchTags({
      endpoint: this.args.endpoint,
      filter: {
        usedByResourceTypes: this.args.usedByResourceTypes,
      },
    });
  });

  changeSelection = (selectedTags: Tag[]) => {
    this.searchTerm = null;
    this.args.onChange?.(
      selectedTags.sort((tagA, tagB) => tagA.label.localeCompare(tagB.label)),
    );
  };

  setSearchTerm = (term: string) => {
    this.searchTerm = term;
  };

  <template>
    {{#if this.tags.value}}
      <PowerSelectMultiple
        @onChange={{this.changeSelection}}
        @options={{this.tags.value}}
        @searchEnabled={{true}}
        @selected={{@selectedTags}}
        @searchField='label'
        @onInput={{this.setSearchTerm}}
        @placeholder={{t
          'snippet-plugin.snippet-list.modal.filter.tag-filter.placeholder'
        }}
        class='template-tag-selector-powerselect'
        ...attributes
        as |tag|
      >
        {{tag.label}}
      </PowerSelectMultiple>
    {{/if}}
  </template>
}
