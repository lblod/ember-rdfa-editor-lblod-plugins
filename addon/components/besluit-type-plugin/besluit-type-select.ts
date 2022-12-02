import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

type Args = {
  besluitTypes: unknown[];
};

export default class BesluitTypePluginBesluitTypeSelectComponent extends Component<Args> {
  @tracked besluitTypes;
  constructor(parent: unknown, args: Args) {
    super(parent, args);
    this.besluitTypes = this.args.besluitTypes.sort((a, b) =>
      a.label > b.label ? 1 : -1
    );
  }

  @action
  search(term: string) {
    const lowerTerm = term.toLowerCase();
    return this.args.besluitTypes.filter((besluitType) =>
      besluitType.label.toLowerCase().includes(lowerTerm)
    );
  }
}
