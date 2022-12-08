import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class BesluitContextCardComponent extends Component {
  @tracked articleElement;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'selectionChanged',
      this.selectionChangedHandler
    );
  }

  @action
  deleteArticle() {
    const range = this.args.controller.rangeFactory.fromAroundNode(
      this.articleElement
    );
    this.args.controller.selection.selectRange(range);
    this.args.controller.executeCommand('delete-selection');
    this.args.controller.executeCommand(
      'recalculate-article-numbers',
      this.args.controller,
      this.besluitUri
    );
  }

  @action
  moveUpArticle() {
    this.args.controller.executeCommand(
      'move-article',
      this.args.controller,
      this.besluitUri,
      this.articleElement,
      true
    );
  }

  @action
  moveDownArticle() {
    this.args.controller.executeCommand(
      'move-article',
      this.args.controller,
      this.besluitUri,
      this.articleElement,
      false
    );
  }

  @action
  selectionChangedHandler() {
    this.articleElement = undefined;
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
      const articleSubjectNodes = limitedDatastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
        .asSubjectNodes()
        .next().value;
      if (articleSubjectNodes) {
        this.articleElement = [...articleSubjectNodes.nodes][0];
      }
      this.besluitUri = besluit.subject.value;
    }
  }
}
