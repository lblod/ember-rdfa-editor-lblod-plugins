import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getTitleForDecision } from '../utils/get-title-for-decision';

export default class BesluitPluginCardComponent extends Component {
  @tracked hasTitle = true;
  @tracked disableArticleInsert = true;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'selectionChanged',
      this.selectionChangedHandler
    );
  }

  @action
  insertArticle() {
    this.args.controller.executeCommand('insert-article', this.args.controller);
  }

  @action
  insertTitle() {
    this.args.controller.executeCommand('insert-title', this.args.controller);
  }

  @action
  selectionChangedHandler() {
    const selectedRange = this.args.controller.selection.lastRange;
    if (!selectedRange) {
      return;
    }
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      selectedRange,
      'rangeIsInside'
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asQuads()
      .next().value;
    if (besluit) {
      this.disableArticleInsert = false;
      this.hasTitle = Boolean(
        getTitleForDecision(
          besluit.subject.value,
          this.args.controller.datastore
        )
      );
      this.besluitUri = besluit.subject.value;
    } else {
      this.disableArticleInsert = true;
      this.hasTitle = true;
    }
  }
}
