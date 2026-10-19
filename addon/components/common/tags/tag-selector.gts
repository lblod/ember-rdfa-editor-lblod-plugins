import Component from '@glimmer/component';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import t from 'ember-intl/helpers/t';
import { Tag } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/common/tags/types';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';

type Signature<T extends Tag> = {
  Args: {
    tags: T[];
    selectedTags?: T[];
    onChange: (tags: T[]) => void;
  } & (
    | {
        allowTagCreation?: false;
        tagConstructor?: never;
      }
    | {
        allowTagCreation: true;
        tagConstructor: (newTag: NewTag) => T;
      }
  );
  Element: HTMLElement;
};
type NewTag = {
  value: string;
  // this works better than a boolean "isNew" for runtime type-checking
  optionType: 'new';
  searchTerm?: string;
};

type SelectorOption<T extends Tag> = T | NewTag;

export default class TagSelector<T extends Tag> extends Component<
  Signature<T>
> {
  @service declare intl: IntlService;

  @tracked searchTerm: string | null = null;

  changeSelection = (selectedTags: SelectorOption<T>[]) => {
    // split up the selected options into existing and new tags
    // this is a bit verbose but it's the most type-safe way to do this
    const existingTags: T[] = [];
    const newTags: NewTag[] = [];
    for (const tagOrNew of selectedTags) {
      if ('optionType' in tagOrNew) {
        newTags.push(tagOrNew);
      } else {
        existingTags.push(tagOrNew);
      }
    }

    this.searchTerm = null;
    // power-select doesn't allow you to make more than 1 new option at at time
    // but just in case
    if (newTags.length > 1) {
      throw new Error(
        'unexpected state, only one new tag should be created at a time',
      );
    }
    const addOption = newTags[0];
    let newSelectedTags;
    if (addOption && this.args.allowTagCreation) {
      const newOption = this.args.tagConstructor(addOption);
      newSelectedTags = [...existingTags, newOption];
    } else {
      newSelectedTags = existingTags;
    }

    this.args.onChange(newSelectedTags);
  };

  get options() {
    const options: SelectorOption<T>[] = this.args.tags.slice();

    if (
      this.args.allowTagCreation &&
      this.searchTerm &&
      !options.find((tag) => tag.value === this.searchTerm)
    ) {
      options.push({
        optionType: 'new',
        value: this.intl.t('common.tags.tag-selector.create-new-tag', {
          tagName: this.searchTerm,
        }),
        searchTerm: this.searchTerm,
      });
    }
    return options;
  }

  setSearchTerm = (term: string) => {
    this.searchTerm = term;
  };

  <template>
    <PowerSelectMultiple
      @onChange={{this.changeSelection}}
      @onInput={{this.setSearchTerm}}
      @options={{this.options}}
      @searchEnabled={{true}}
      @selected={{@selectedTags}}
      @searchField='value'
      @placeholder={{t 'common.tags.tag-selector.placeholder'}}
      @noMatchesMessage={{t 'common.tags.tag-selector.no-results-message'}}
      class='say-tag-selector'
      ...attributes
      as |tag|
    >
      <span class='say-tag-selector__item' title={{tag.value}}>
        {{tag.value}}
      </span>
    </PowerSelectMultiple>
  </template>
}
