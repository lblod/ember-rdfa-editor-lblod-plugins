import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { BesluitTopic } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/fetchBesluitTopics';

type Args = {
  besluitTopics: BesluitTopic[];
};

export default class BesluitTopicSelectComponent extends Component<Args> {
  AlertTriangleIcon = AlertTriangleIcon;

  @tracked besluitTopics: BesluitTopic[] = [];

  constructor(parent: unknown, args: Args) {
    super(parent, args);

    this.besluitTopics = this.args.besluitTopics.sort((a, b) =>
      a.label > b.label ? 1 : -1,
    );
  }

  @action
  search(term: string) {
    const lowerTerm = term.toLowerCase();

    return this.args.besluitTopics.filter((besluitTopic) =>
      besluitTopic.label.toLowerCase().includes(lowerTerm),
    );
  }
}
