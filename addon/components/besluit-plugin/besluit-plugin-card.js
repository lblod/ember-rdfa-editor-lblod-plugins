import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getTitleForDecision } from '../../utils/besluit-plugin/get-title-for-decision';
import {
  insertTitle,
  insertArticle,
} from '@lblod/ember-rdfa-editor-lblod-plugins/commands/besluit-plugin';

export default class BesluitPluginCardComponent extends Component {
  @tracked hasTitle = true;
  @tracked disableArticleInsert = true;

  constructor(parent, args) {
    super(parent, args);
  }

  get controller() {
    return this.args.controller;
  }

  @action
  insertArticle() {
    insertArticle(this.controller, '', '');
  }

  @action
  insertTitle() {
    insertTitle(this.controller, '');
  }

  @action
  selectionChangedHandler() {
    const currentSelection = this.args.controller.state.selection;
    if (!currentSelection) {
      return;
    }
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.state,
      currentSelection.from,
      currentSelection.to
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asQuads()
      .next().value;
    if (besluit) {
      this.disableArticleInsert = false;
      this.hasTitle = Boolean(
        getTitleForDecision(besluit.subject.value, this.controller.datastore)
      );
      this.besluitUri = besluit.subject.value;
    } else {
      this.disableArticleInsert = true;
      this.hasTitle = true;
    }
  }
}
