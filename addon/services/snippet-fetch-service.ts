import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { fetchSnippetListNames } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';
import { SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

export default class SnippetFetchService extends Service {
  @tracked listNameCache = new Map<string, string>();

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
}
