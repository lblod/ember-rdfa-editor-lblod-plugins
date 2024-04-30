import { htmlSafe } from '@ember/template';

import { optionMapOr } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { dateValue } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { SafeString } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/types';

export type SnippetPluginConfig = {
  endpoint: string;
};

interface SnippetArgs {
  title: string | null;
  createdOn: string | null;
  content: string | null;
}

export class Snippet {
  content: SafeString | null;
  createdOn: string | null;
  title: string | null;

  constructor({ title, createdOn, content }: SnippetArgs) {
    this.content = optionMapOr(null, htmlSafe, content);
    this.createdOn = dateValue(createdOn ?? undefined);
    this.title = title;
  }
}

interface SnippetListArgs {
  id: string | null;
  label: string | null;
  createdOn: string | null;
}

const snippetListBase = 'http://lblod.data.gift/snippet-lists/';

export const getSnippetUriFromId = (id: string) => `${snippetListBase}${id}`;

export const getSnippetIdFromUri = (uri: string) =>
  uri.replace(snippetListBase, '');

export class SnippetList {
  id: string | null;
  label: string | null;
  createdOn: string | null;

  constructor({ id, label, createdOn }: SnippetListArgs) {
    this.id = id ? getSnippetIdFromUri(id) : null;
    this.label = label;
    this.createdOn = dateValue(createdOn ?? undefined);
  }
}
