import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

type Args = {
  count: number;
  pageSize: number;
  goToPage: (n: number) => void;
};
export default class RoadsignsPagination extends Component<Args> {
  @tracked actualPageStart = 0;
  @tracked actualPageEnd = 10;

  get hasNextPage() {
    return this.args.count > this.pageEnd;
  }

  get hasPreviousPage() {
    return this.actualPageStart > 0;
  }

  get count() {
    return this.args.count;
  }

  get pageStart() {
    return this.actualPageStart + 1;
  }

  get pageEnd() {
    if (this.actualPageEnd > this.args.count) {
      return this.args.count;
    } else {
      return this.actualPageEnd;
    }
  }

  @action
  onUpdateCount(_element: HTMLElement, [_, pageStart]: [number, number]) {
    this.actualPageStart = pageStart;
    this.actualPageEnd = pageStart + this.args.pageSize;
  }

  @action
  goToPreviousPage() {
    const newPageStart = this.actualPageStart - this.args.pageSize;
    this.actualPageStart = newPageStart;
    this.actualPageEnd = newPageStart + this.args.pageSize;
    this.args.goToPage(newPageStart);
  }

  @action
  goToNextPage() {
    const newPageStart = this.actualPageStart + this.args.pageSize;
    this.actualPageStart = newPageStart;
    this.actualPageEnd = newPageStart + this.args.pageSize;
    this.args.goToPage(newPageStart);
  }
}
