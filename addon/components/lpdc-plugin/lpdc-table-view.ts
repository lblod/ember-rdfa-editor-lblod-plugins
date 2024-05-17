import Component from '@glimmer/component';
import { LPDC } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lpdc-plugin';

interface Args {
  lpdc: LPDC[] & {
    meta: {
      count: number;
      pagination: { first: { number: number }; last: { number: number } };
    };
  };
  isLoading: boolean;
  onLpdcInsert: (lpdc: LPDC) => void;
  // Filtering
  nameFilter: string | null;
  // Pagination
  pageNumber: number;
}

export default class LpdcTableViewComponent extends Component<Args> {
  get lpdc() {
    return this.args.lpdc;
  }
}
