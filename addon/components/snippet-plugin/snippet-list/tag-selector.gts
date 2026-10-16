import Component from '@glimmer/component';
import { trackedFunction } from 'reactiveweb/function';
import { service } from '@ember/service';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import type IntlService from 'ember-intl/services/intl';
import {
  Tag,
  TaggableResourceType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { fetchTags } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';
import t from 'ember-intl/helpers/t';

type Signature = {
  Args: {
    endpoint: string;
    onChange: (tags: Tag[]) => void;
    selectedTags?: Tag[];
    taggableTypes?: TaggableResourceType[];
  };
  Element: HTMLElement;
};

export default class TagSelector extends Component<Signature> {
  @service declare intl: IntlService;

  tags = trackedFunction<Promise<Tag[]>>(this, async () => {
    return fetchTags({
      endpoint: this.args.endpoint,
      filter: {
        taggableTypes: this.args.taggableTypes,
      },
    });
  });

  changeSelection = (selectedTags: Tag[]) => {
    this.args.onChange?.(
      selectedTags.sort((tagA, tagB) => tagA.label.localeCompare(tagB.label)),
    );
  };

  <template>
    {{#if this.tags.value}}
      <PowerSelectMultiple
        @onChange={{this.changeSelection}}
        @options={{this.tags.value}}
        @searchEnabled={{true}}
        @selected={{@selectedTags}}
        @searchField='label'
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
