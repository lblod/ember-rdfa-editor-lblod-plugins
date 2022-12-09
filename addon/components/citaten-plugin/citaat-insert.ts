import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { LEGISLATION_TYPES } from '../../utils/legislation-types';
import { ProseController } from '@lblod/ember-rdfa-editor/addon';
import {
  Article,
  Decision,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/vlaamse-codex';
import { insertHtml } from '@lblod/ember-rdfa-editor/addon/commands/insert-html-command';

interface Args {
  controller: ProseController;
}

export default class EditorPluginsCitaatInsertComponent extends Component<Args> {
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

  @action
  openModal() {
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  insertDecisionCitation(decision: Decision) {
    const type = decision.legislationType?.label;
    const uri = decision.uri;
    const title = decision.title ?? '';
    const { from, to } = this.args.controller.state.selection;
    const citationHtml = `${
      type ? type : ''
    } <a class="annotation" href="${uri}" property="eli:cites" typeof="eli:LegalExpression">${title}</a>&nbsp;`;
    this.args.controller.doCommand(insertHtml(citationHtml, from, to));
  }

  @action
  insertArticleCitation(decision: Decision, article: Article) {
    const type = decision.legislationType?.label;
    const uri = article.uri;
    let title = '';
    if (decision.title) {
      title = `${decision.title}, ${article.number ?? ''}`;
    }
    const { from, to } = this.args.controller.state.selection;
    const citationHtml = `${
      type ? type : ''
    } <a class="annotation" href="${uri}" property="eli:cites" typeof="eli:LegalExpression">${title}</a>&nbsp;`;
    this.args.controller.doCommand(insertHtml(citationHtml, from, to));
  }
}
