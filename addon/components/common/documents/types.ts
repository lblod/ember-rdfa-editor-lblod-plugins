import { htmlSafe } from '@ember/template';

import { optionMapOr } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { SafeString } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/types';

interface PreviewableDocumentArgs {
  title: string | null;
  content: string | null;
}

export class PreviewableDocument {
  content: SafeString | null;
  title: string | null;

  constructor({ title, content }: PreviewableDocumentArgs) {
    this.content = optionMapOr(null, htmlSafe, content);
    this.title = title;
  }
}
