import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  SearchSort,
  WorshipService,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin/utils/fetchWorshipServices';

interface Args {
  label: string;
  field: keyof WorshipService;
  sort: SearchSort;
  setSort: (sort: SearchSort) => void;
}

export default class SnippetInsertComponent extends Component<Args> {
  get order() {
    if (this.args.sort) {
      const [sortedField, order] = this.args.sort;
      if (sortedField === this.args.field) {
        return order;
      }
    }
    return false;
  }

  @action changeSort() {
    const order = this.order;
    let newSort: SearchSort;
    if (!order) {
      newSort = [this.args.field, 'ASC'];
    } else if (order === 'ASC') {
      newSort = [this.args.field, 'DESC'];
    } else {
      newSort = false;
    }
    this.args.setSort(newSort);
  }
}
