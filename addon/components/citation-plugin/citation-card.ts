import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import {
  Article,
  cleanCaches,
  Decision,
  fetchDecisions,
} from '../../plugins/citation-plugin/utils/vlaamse-codex';
import {
  LEGISLATION_TYPE_CONCEPTS,
  LEGISLATION_TYPES,
} from '../../utils/legislation-types';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import {
  Option,
  unwrap,
  unwrapOr,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import {
  CitationDecoration,
  citationKey,
  CitationSchema,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { ProseController, Transaction } from '@lblod/ember-rdfa-editor';
import { citedText } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/cited-text';

interface Args {
  controller: ProseController;
}

export default class CitationCardComponent extends Component<Args> {
  @tracked pageNumber = 0;
  @tracked pageSize = 5;
  @tracked totalSize = 0;
  @tracked totalCount = 0;
  @tracked decisions = [];
  @tracked error: unknown;
  @tracked showModal = false;
  @tracked decision: Decision | null = null;
  @tracked cardText: string | null = null;
  @tracked cardLegislationType: string | null = null;

  get controller(): ProseController {
    return this.args.controller;
  }

  get selectedMarkRange(): { from: number; to: number } | null {
    const { from, to } = this.args.controller.state.selection;

    let found = false;
    let result = null;
    this.controller.state.doc.nodesBetween(from, to, (node, pos) => {
      if (
        (this.controller.schema as CitationSchema).marks.citation.isInSet(
          node.marks
        )
      ) {
        result = { from: pos, to: pos + node.nodeSize };
        found = true;
      }
      return !found;
    });
    return result;
  }

  get showCard() {
    return this.activeDecoration;
  }

  get activeDecoration(): Option<CitationDecoration> {
    const decorations = unwrap(citationKey.getState(this.controller.state));
    const { from, to } = this.controller.state.selection;
    return decorations.find(from, to)[0];
  }

  get documentLegislationType(): Option<string> {
    return this.activeDecoration?.spec.legislationTypeUri;
  }

  get documentText(): Option<string> {
    return this.activeDecoration?.spec.searchText;
  }

  get searchText(): string {
    return (this.cardText ?? this.documentText) || '';
  }

  get legislationTypes() {
    return Object.keys(LEGISLATION_TYPES).map(capitalize);
  }

  get selectedLegislationType() {
    const type = this.cardLegislationType || this.documentLegislationType;
    const found = LEGISLATION_TYPE_CONCEPTS.find((c) => c.value === type);
    return found || unwrap(LEGISLATION_TYPE_CONCEPTS[0]);
  }

  get selectedLegislationTypeLabel(): string {
    return capitalize(this.selectedLegislationType.label);
  }

  get selectedLegislationTypeUri(): string {
    return this.selectedLegislationType.value;
  }

  @action resetToDocumentState(): void {
    this.cardText = null;
    this.cardLegislationType = null;
  }

  @action onCardTextChange(event: InputEvent): void {
    this.cardText = (event.target as HTMLInputElement).value;
  }

  resourceSearch = restartableTask(async () => {
    await timeout(100);
    this.error = null;
    const abortController = new AbortController();
    try {
      // Split search string by grouping on non-whitespace characters
      // This probably needs to be more complex to search on group of words
      const words = this.searchText.match(/\S+/g) || [];
      const filter = {
        type: unwrapOr('', this.selectedLegislationTypeUri),
      };
      const results = await fetchDecisions(
        words,
        filter,
        this.pageNumber,
        this.pageSize
      );
      this.totalCount = results.totalCount;
      return results.decisions;
    } catch (e) {
      console.warn(e); // eslint-ignore-line no-console
      this.totalCount = 0;
      this.error = e;
      return [];
    } finally {
      //Abort all requests now that this task has either successfully finished or has been cancelled
      abortController.abort();
    }
  });

  decisionResource = trackedTask(this, this.resourceSearch, () => [
    this.searchText,
    this.selectedLegislationType,
    this.pageNumber,
    this.pageSize,
  ]);

  @action
  selectLegislationType(type: string) {
    type = type.toLowerCase();
    const found = LEGISLATION_TYPE_CONCEPTS.find(
      (c) => c.label.toLowerCase() === type
    );
    this.cardLegislationType = found
      ? found.value
      : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).value;
  }

  @action
  openDecisionDetailModal(decision: Decision): void {
    this.decision = decision;
    /** why focus? see {@link EditorPluginsCitationInsertComponent.openModal } */
    this.focus();
    this.showModal = true;
  }

  @action
  async openSearchModal(): Promise<void> {
    await this.decisionResource.cancel();
    this.decision = null;
    this.focus();
    this.showModal = true;
  }

  @action
  closeModal(lastSearchType: string, lastSearchTerm: string): void {
    this.showModal = false;
    this.decision = null;
    if (lastSearchType) {
      this.cardLegislationType = lastSearchType;
    }
    if (lastSearchTerm) {
      this.cardText = lastSearchTerm;
    }
  }

  @action
  insertDecisionCitation(decision: Decision): void {
    const uri = decision.uri;
    const title = decision.title ?? '';
    const { from, to } = unwrap(this.activeDecoration);
    this.controller.withTransaction((tr: Transaction) =>
      tr
        .replaceRangeWith(
          from,
          to,
          citedText(this.controller.schema, title, uri)
        )
        .scrollIntoView()
    );
  }

  @action
  insertArticleCitation(decision: Decision, article: Article): void {
    const uri = article.uri;
    let title = '';
    if (decision.title) {
      title = `${decision.title}, ${article.number || ''}`;
    }
    const { from, to } = unwrap(this.activeDecoration);
    this.controller.withTransaction((tr: Transaction) =>
      tr
        .replaceRangeWith(
          from,
          to,
          citedText(this.controller.schema, title, uri)
        )
        .scrollIntoView()
    );
  }

  @action
  focus(): void {
    this.controller.focus();
  }

  willDestroy(): void {
    // Not necessary as ember-concurrency does this for us.
    // this.decisionResource.cancel();
    cleanCaches();
    super.willDestroy();
  }
}
