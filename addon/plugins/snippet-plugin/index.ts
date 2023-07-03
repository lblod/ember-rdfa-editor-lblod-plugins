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
