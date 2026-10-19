import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export type Tag = {
  value: string;
};

export type TagWithUri = Tag & {
  uri: string;
};

const SNIPPET_LIST_TYPE = SAY('SnippetList').full;
export type TaggableResourceType = typeof SNIPPET_LIST_TYPE;
