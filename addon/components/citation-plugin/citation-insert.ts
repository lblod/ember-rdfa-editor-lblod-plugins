import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { LEGISLATION_TYPES } from '../../utils/legislation-types';
import {
  Fragment,
  ProseController,
  Slice,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import {
  Article,
  Decision,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/vlaamse-codex';
import { citedText } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/cited-text';

interface Args {
  controller: ProseController;
}

export default class EditorPluginsCitationInsertComponent extends Component<Args> {
  @tracked disableInsert = false;
  @tracked showModal = false;
  @tracked legislationTypeUri = LEGISLATION_TYPES.decreet;
  @tracked text = '';

  onSelectionChanged() {
    const { from, to } = this.args.controller.state.selection;
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.state,
      from,
      to
    );
    const motivering = limitedDatastore
      .match(null, '>http://data.vlaanderen.be/ns/besluit#motivering')
      .asQuadResultSet()
      .first();
    this.disableInsert = !motivering;
  }

  get controller() {
    return this.args.controller;
  }

  @action
  openModal() {
    // we focus BEFORE openening the modal, since the modal uses ember-focus-trap
    // that takes control of the focus, and gives it back when disabled
    // so we have to reset the focus to the editor before opening (because
    // we lost it upon clicking the button)
    this.controller.focus();
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  insertDecisionCitation(decision: Decision) {
    const type = decision.legislationType?.label || '';
    const uri = decision.uri;
    const title = decision.title ?? '';
    this.controller.withTransaction((tr: Transaction) =>
      tr
        .replaceSelection(
          new Slice(
            Fragment.fromArray([
              this.controller.schema.text(`${type} `),
              citedText(this.controller.schema, title, uri),
            ]),
            0,
            0
          )
        )
        .scrollIntoView()
    );
  }

  @action
  insertArticleCitation(decision: Decision, article: Article) {
    const type = decision.legislationType?.label || '';
    const uri = article.uri;
    let title = '';
    if (decision.title) {
      title = `${decision.title}, ${article.number ?? ''}`;
    }
    const { from, to } = this.args.controller.state.selection;
    this.controller.withTransaction((tr: Transaction) =>
      tr.replaceWith(from, to, [
        this.controller.schema.text(`${type} `),
        citedText(this.controller.schema, title, uri),
      ])
    );
  }
}
