import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { capitalize } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';
import {
  Option,
  unwrap,
  unwrapOr,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import {
  CitationDecoration,
  CitationPluginEmberComponentConfig,
  CitationPluginState,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import {
  DecorationSet,
  PluginKey,
  SayController,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { citedText } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/cited-text';
import {
  LEGISLATION_TYPE_CONCEPTS,
  legislationKeysCapitalized,
  legislationKeysCapitalizedWithoutGemeentebesluit,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/types';
import { Article } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/article';
import {
  fetchLegalDocuments,
  LegalDocument,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';
import { cleanCaches } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/cache';
import { SearchIcon } from '@appuniversum/ember-appuniversum/components/icons/search';
import { citationPluginKey } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';

interface Args {
  controller: SayController;
  config: CitationPluginEmberComponentConfig;
}

/* A component card that will only show up when certain keywords are typed */
export default class CitationCardComponent extends Component<Args> {
  SearchIcon = SearchIcon;

  @tracked pageNumber = 0;
  @tracked pageSize = 5;
  @tracked totalSize = 0;
  @tracked totalCount = 0;
  @tracked error: unknown;
  @tracked showModal = false;
  @tracked legalDocument: LegalDocument | null = null;
  @tracked cardText: string | null = null;
  @tracked cardLegislationType: string | null = null;
  @tracked documentLegislationType: Option<string>;
  @tracked documentText: Option<string>;

  @action
  update() {
    if (this.activeDecoration) {
      const { legislationTypeUri, searchText } = this.activeDecoration.spec;
      if (legislationTypeUri !== this.documentLegislationType) {
        this.documentLegislationType = legislationTypeUri;
      }
      if (searchText !== this.documentText) {
        this.documentText = searchText;
      }
    }
  }

  get controller(): SayController {
    return this.args.controller;
  }

  get showCard() {
    return !this.controller.inEmbeddedView && this.activeDecoration;
  }

  get plugin(): PluginKey<CitationPluginState> {
    return citationPluginKey;
  }

  get config() {
    return this.args.config;
  }

  get decorations(): DecorationSet | undefined {
    return this.plugin.getState(this.controller.mainEditorState)?.highlights;
  }

  get activeDecoration(): Option<CitationDecoration> {
    const { from, to } = this.controller.mainEditorState.selection;
    return this.decorations?.find(from, to)[0];
  }

  get searchText(): string {
    return (this.cardText ?? this.documentText) || '';
  }

  get legislationTypes() {
    if (this.config.decisionsEndpoint) {
      return legislationKeysCapitalized;
    }

    return legislationKeysCapitalizedWithoutGemeentebesluit;
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

  get governmentName() {
    return this.config.defaultDecisionsGovernmentName;
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
        governmentName: this.governmentName,
      };
      const results = await fetchLegalDocuments({
        words: words,
        filter: filter,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        config: this.args.config,
      });
      this.totalCount = results.totalCount;
      return results.legalDocuments;
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

  legalDocumentsResource = trackedTask(this, this.resourceSearch, () => [
    this.searchText,
    this.selectedLegislationType,
    this.pageNumber,
    this.pageSize,
  ]);

  @action
  selectLegislationType(type: string) {
    type = type.toLowerCase();
    const found = LEGISLATION_TYPE_CONCEPTS.find(
      (c) => c.label.toLowerCase() === type,
    );
    this.cardLegislationType = found
      ? found.value
      : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).value;
  }

  @action
  openLegalDocumentDetailModal(legalDocument: LegalDocument): void {
    this.legalDocument = legalDocument;
    /** why focus? see {@link EditorPluginsCitationInsertComponent.openModal } */
    this.focus();
    this.showModal = true;
  }

  @action
  async openSearchModal(): Promise<void> {
    await this.legalDocumentsResource.cancel();
    this.legalDocument = null;
    this.focus();
    this.showModal = true;
  }

  @action
  closeModal(lastSearchType: string, lastSearchTerm: string): void {
    this.showModal = false;
    this.legalDocument = null;
    if (lastSearchType) {
      this.cardLegislationType = lastSearchType;
    }
    if (lastSearchTerm) {
      this.cardText = lastSearchTerm;
    }
  }

  @action
  insertLegalDocumentCitation(legalDocument: LegalDocument): void {
    const uri = legalDocument.uri;
    const title = legalDocument.title ?? '';
    const { from, to } = unwrap(this.activeDecoration);
    this.controller.withTransaction(
      (tr: Transaction) =>
        tr
          .replaceRangeWith(
            from,
            to,
            citedText(this.controller.schema, title, uri),
          )
          .scrollIntoView(),
      { view: this.controller.mainEditorView },
    );
    this.controller.focus();
  }

  @action
  insertArticleCitation(legalDocument: LegalDocument, article: Article): void {
    const uri = article.uri;
    let title = '';
    if (legalDocument.title) {
      title = `${legalDocument.title}, ${article.number || ''}`;
    }
    const { from, to } = unwrap(this.activeDecoration);
    this.controller.withTransaction(
      (tr: Transaction) =>
        tr
          .replaceRangeWith(
            from,
            to,
            citedText(this.controller.schema, title, uri),
          )
          .scrollIntoView(),
      { view: this.controller.mainEditorView },
    );
  }

  @action
  focus(): void {
    this.controller.focus();
  }

  willDestroy(): void {
    // Not necessary as ember-concurrency does this for us.
    // this.legalDocumentsResource.cancel();
    cleanCaches();
    super.willDestroy();
  }
}
