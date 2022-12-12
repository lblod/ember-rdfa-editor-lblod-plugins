import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// import { task } from 'ember-concurrency-decorators';
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
import { ProseController } from '@lblod/ember-rdfa-editor';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

const BASIC_MULTIPLANE_CHARACTER = '\u0021-\uFFFF'; // most of the characters used around the world

// Regex nicely structured:
// (
//   (
//     \w*decreet |
//     omzendbrief |
//     verdrag |
//     grondwetswijziging |
//     samenwerkingsakkoord |
//     \w*wetboek |
//     protocol |
//     besluit[^\S\n]van[^\S\n]de[^\S\n]vlaamse[^\S\n]regering |
//     geco[öo]rdineerde wetten |
//     \w*wet |
//     koninklijk[^\S\n]?besluit |
//     ministerieel[^\S\n]?besluit |
//     genummerd[^\S\n]?koninklijk[^\S\n]?besluit
//   )
//   [^\S\n]*
//   (
//     ([^\S\n] | [\u0021-\uFFFF\d;:'"()&\-_]){3,}
//   )?
// )
const NNWS = '[^\\S\\n]';
const CITATION_REGEX = new RegExp(
  `((\\w*decreet|omzendbrief|verdrag|grondwetswijziging|samenwerkingsakkoord|\\w*wetboek|protocol|besluit${NNWS}van${NNWS}de${NNWS}vlaamse${NNWS}regering|geco[öo]rdineerde${NNWS}wetten|\\w*wet|koninklijk${NNWS}?besluit|ministerieel${NNWS}?besluit|genummerd${NNWS}?koninklijk${NNWS}?besluit|\\w*${NNWS}?besluit)${NNWS}*((${NNWS}|[${BASIC_MULTIPLANE_CHARACTER};:'"()&-_]){3,})?)`,
  'uig'
);

interface Args {
  controller: ProseController;
}

export default class CitaatCardComponent extends Component<Args> {
  @tracked pageNumber = 0;
  @tracked pageSize = 5;
  @tracked totalSize = 0;
  @tracked totalCount = 0;
  @tracked decisions = [];
  @tracked error: unknown;
  @tracked showModal = false;
  @tracked decision: Decision | null = null;
  @tracked textAfterTimeout = '';

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

  get legislationTypeUri(): Option<string> {
    return this.activeDecoration?.spec.legislationTypeUri;
  }

  get text(): Option<string> {
    return this.activeDecoration?.spec.searchText;
  }

  get legislationTypes() {
    return Object.keys(LEGISLATION_TYPES).map(capitalize);
  }

  get legislationSelected() {
    const found = LEGISLATION_TYPE_CONCEPTS.find(
      (c) => c.value === this.legislationTypeUri
    );
    return capitalize(
      found ? found.label : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).label
    );
  }

  updateSearch = restartableTask(async () => {
    await timeout(500);
    this.textAfterTimeout = this.text ?? '';
  });

  @action
  updateSearchImmediate() {
    this.textAfterTimeout = this.text ?? '';
  }

  resourceSearch = restartableTask(async () => {
    this.error = null;
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await undefined; //To prevent other variables used below (this.text and this.legislationTypeUri) to trigger a retrigger.
    const abortController = new AbortController();
    try {
      // Split search string by grouping on non-whitespace characters
      // This probably needs to be more complex to search on group of words
      const words =
        (this.textAfterTimeout || this.text || '').match(/\S+/g) || [];
      const filter = {
        type: unwrapOr('', this.legislationTypeUri),
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
    this.textAfterTimeout,
    this.pageNumber,
    this.pageSize,
  ]);

  @action
  selectLegislationType(type: string) {
    type = type.toLowerCase();
    const found = LEGISLATION_TYPE_CONCEPTS.find(
      (c) => c.label.toLowerCase() === type
    );
    // this.legislationTypeUri = found
    //   ? found.value
    //   : unwrap(LEGISLATION_TYPE_CONCEPTS[0]).value;
  }

  @action
  openDecisionDetailModal(decision: Decision) {
    this.decision = decision;
    this.showModal = true;
  }

  @action
  async openSearchModal() {
    await this.decisionResource.cancel();
    this.decision = null;
    this.showModal = true;
  }

  @action
  async closeModal(lastSearchType: string, lastSearchTerm: string) {
    this.showModal = false;
    this.decision = null;
    if (lastSearchType) {
      // this.legislationTypeUri = lastSearchType;
    }
    if (lastSearchTerm) {
      // this.text = lastSearchTerm;
    }
    if (lastSearchType || lastSearchTerm) {
      this.updateSearchImmediate();
    }
  }

  @action
  insertDecisionCitation(decision: Decision) {
    const type = decision.legislationType?.label;
    const uri = decision.uri;
    const title = decision.title ?? '';
    const { from, to } = unwrap(this.selectedMarkRange);
    const citationHtml = `${
      type ? type : ''
    } <a class="annotation" href="${uri}" property="eli:cites" typeof="eli:LegalExpression">${title}</a>&nbsp;`;
    this.controller.doCommand(insertHtml(citationHtml, from, to));
  }

  @action
  insertArticleCitation(decision: Decision, article: Article) {
    const type = decision.legislationType?.label;
    const uri = article.uri;
    let title = '';
    if (decision.title) {
      title = `${decision.title}, ${article.number || ''}`;
    }
    const { from, to } = unwrap(this.selectedMarkRange);
    const citationHtml = `${
      type ? type : ''
    } <a class="annotation" href="${uri}" property="eli:cites" typeof="eli:LegalExpression">${title}</a>&nbsp;`;
    this.controller.doCommand(insertHtml(citationHtml, from, to));
  }

  willDestroy() {
    // Not necessary as ember-concurrency does this for us.
    // this.decisionResource.cancel();
    cleanCaches();
    super.willDestroy();
  }
}
