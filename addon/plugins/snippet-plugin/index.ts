import { htmlSafe } from '@ember/template';

import {
  type Option,
  optionMapOr,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
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

export type ImportedResourceMap = Record<string, Option<string>>;

export type SnippetListArgs = {
  id: string;
  label: string;
  createdOn: string;
  importedResources: string[];
};

const snippetListBase = 'http://lblod.data.gift/snippet-lists/';

export const getSnippetUriFromId = (id: string) => `${snippetListBase}${id}`;

export const getSnippetIdFromUri = (uri: string) =>
  uri.replace(snippetListBase, '');

export class SnippetList {
  id: string;
  label: string;
  createdOn: string | null;
  importedResources: string[];

  constructor({ id, label, createdOn, importedResources }: SnippetListArgs) {
    this.id = getSnippetIdFromUri(id);
    this.label = label;
    this.createdOn = dateValue(createdOn);
    this.importedResources = importedResources;
  }
}
