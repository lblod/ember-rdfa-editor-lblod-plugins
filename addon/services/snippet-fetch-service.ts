import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  fetchSnippetListNames,
  fetchSnippets,
  Pagination,
  SnippetFilter,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';
import {
  Snippet,
  SnippetPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

export default class SnippetFetchService extends Service {
  @tracked listNameCache = new Map<string, string>();
  @tracked snippetPageCache = new Map<
    string,
    { totalCount: number; pages: Map<number, Snippet[]> }
  >();

  async getListNames(
    config: SnippetPluginConfig,
    listUris: string[],
  ): Promise<string[]> {
    if (listUris.every((uri) => this.listNameCache.has(uri))) {
      return listUris.map((uri) => this.listNameCache.get(uri) as string);
    }
    const abortController = new AbortController();
    const listNames = await fetchSnippetListNames({
      endpoint: config.endpoint,
      abortSignal: abortController.signal,
      snippetListUris: listUris,
    });
    listNames.forEach((name, uri) => this.listNameCache.set(uri, name));

    return [...listNames.values()];
  }

  async getSnippets({
    endpoint,
    abortSignal,
    filter,
    pagination,
  }: {
    endpoint: string;
    abortSignal: AbortSignal;
    filter: SnippetFilter;
    pagination: Pagination;
  }) {
    if (filter.name || !filter.snippetListUris?.length) {
      // Filtering, so just search, to avoid mess of re-implementing local filtering to match that
      // of the server. Undefined or empty uri lists are ignored by the fetch function, so pass
      // those through too.
      return fetchSnippets({ endpoint, abortSignal, filter, pagination });
    }
    const cacheKey = filter.snippetListUris.join('---');
    let cachedPages = this.snippetPageCache.get(cacheKey);
    if (!cachedPages) {
      cachedPages = { totalCount: -1, pages: new Map() };
      this.snippetPageCache.set(cacheKey, cachedPages);
    }
    const cachedPage = cachedPages.pages.get(pagination.pageNumber);
    if (!cachedPage) {
      const fetched = await fetchSnippets({
        endpoint,
        abortSignal,
        filter,
        pagination,
      });
      cachedPages.totalCount = fetched.totalCount;
      cachedPages.pages.set(pagination.pageNumber, fetched.results);
      return fetched;
    }
    return { totalCount: cachedPages.totalCount, results: cachedPage };
  }
}
