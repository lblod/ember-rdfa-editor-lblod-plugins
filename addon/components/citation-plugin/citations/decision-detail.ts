import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';

import { LegalDocument } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';
import { fetchArticles } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/article';

interface Args {
  decision: LegalDocument;
  close: () => void;
  config: { endpoint: string };
}

export default class EditorPluginsCitationsDecisionDetailComponent extends Component<Args> {
  @tracked error: unknown;
  @tracked pageNumber = 0;
  @tracked pageSize = 5;
  @tracked totalCount = 0;
  @tracked articles = [];
  @tracked articleFilter = '';
  @tracked articleFilterAfterTimeout = '';

  updateArticleFilter = restartableTask(async () => {
    await timeout(500);
    this.pageNumber = 0;
    this.articleFilterAfterTimeout = this.articleFilter;
  });

  resourceSearch = restartableTask(async () => {
    this.error = null;
    const abortController = new AbortController();
    try {
      const results = await fetchArticles({
        legalExpression: this.args.decision.uri,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        articleFilter: this.articleFilterAfterTimeout,
        config: this.args.config,
      });
      this.totalCount = results.totalCount;
      return results.articles;
    } catch (e) {
      console.warn(e); // eslint-ignore-line no-console
      this.totalCount = 0;
      this.error = e;
      return [];
    } finally {
      abortController.abort();
    }
  });

  articleResource = trackedTask(this, this.resourceSearch, () => [
    this.pageNumber,
    this.pageSize,
    this.articleFilterAfterTimeout,
  ]);

  @action
  async close() {
    await this.articleResource.cancel();
    this.args.close();
  }

  // Pagination

  @action
  previousPage() {
    --this.pageNumber;
  }

  @action
  nextPage() {
    ++this.pageNumber;
  }

  get rangeStart() {
    return this.pageNumber * this.pageSize + 1;
  }

  get rangeEnd() {
    const end = this.rangeStart + this.pageSize - 1;
    return end > this.totalCount ? this.totalCount : end;
  }

  get isFirstPage() {
    return this.pageNumber == 0;
  }

  get isLastPage() {
    return this.rangeEnd == this.totalCount;
  }
}
