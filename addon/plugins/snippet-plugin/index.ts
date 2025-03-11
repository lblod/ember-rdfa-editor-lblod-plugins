import { PreviewableDocument } from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/documents/types';
import { type Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { dateValue } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';

export const DEFAULT_CONTENT_STRING = 'block+';

export type SnippetPluginConfig = {
  endpoint: string;
  allowedContent?: string;
  hidePlaceholderInsertButton?: boolean;
};

interface SnippetArgs {
  title: string | null;
  createdOn: string | null;
  content: string | null;
}

export class Snippet implements PreviewableDocument {
  content: string | null;
  createdOn: string | null;
  title: string | null;

  constructor({ title, createdOn, content }: SnippetArgs) {
    this.content = content;
    this.createdOn = dateValue(createdOn ?? undefined);
    this.title = title;
  }
}

export type ImportedResourceMap = Record<string, Option<string>>;

export type SnippetListProperties = {
  placeholderId: string;
  listUris: string[];
  names: string[];
  importedResources: ImportedResourceMap;
};

export type SnippetListArgs = {
  uri: string;
  label: string;
  createdOn: string;
  importedResources: string[];
};

export class SnippetList {
  uri: string;
  label: string;
  createdOn: string | null;
  importedResources: string[];

  constructor({ uri, label, createdOn, importedResources }: SnippetListArgs) {
    this.uri = uri;
    this.label = label;
    this.createdOn = dateValue(createdOn);
    this.importedResources = importedResources;
  }
}
