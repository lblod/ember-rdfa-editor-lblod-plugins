import { action } from '@ember/object';
import Component from '@glimmer/component';
import { NavUpIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-up';
import { NavDownIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-down';
import { NavUpDownIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-up-down';

type SearchSort = [string, 'ASC' | 'DESC'] | false;
interface Args {
  label: string;
  field: string;
  sort: SearchSort;
  setSort: (sort: SearchSort) => void;
}

export default class SortableTableHeaderComponent extends Component<Args> {
  NavUpIcon = NavUpIcon;
  NavDownIcon = NavDownIcon;
  NavUpDownIcon = NavUpDownIcon;

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
