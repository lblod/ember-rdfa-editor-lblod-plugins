import { action } from '@ember/object';
import Component from '@glimmer/component';

interface Args {
  label: string;
  field: string;
  sort: string | false;
  setSort: (sort: string | false) => void;
}

export default class SnippetInsertComponent extends Component<Args> {
  get order() {
    if (this.args.sort) {
      const sortedField = this.args.sort.startsWith('-')
        ? this.args.sort.slice(1)
        : this.args.sort;
      if (sortedField === this.args.field) {
        return this.args.sort.startsWith('-') ? 'desc' : 'asc';
      }
    }
    return false;
  }

  @action changeSort() {
    const order = this.order;
    let newSort: string | false;
    if (!order) {
      newSort = this.args.field;
    } else if (order === 'asc') {
      newSort = `-${this.args.field}`;
    } else {
      newSort = false;
    }
    this.args.setSort(newSort);
  }
}
