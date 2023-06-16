import { htmlSafe } from '@ember/template';

import {
  NodeViewConstructor,
  Plugin,
  SayController,
  Schema,
} from '@lblod/ember-rdfa-editor';
import { optionMapOr } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { dateValue } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { SafeString } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/types';

export type FragmentPluginConfig = {
  endpoint: string;
  editorConfig: {
    schema: Schema;
    plugins: Plugin[];
    nodeViews: (
      controller: SayController
    ) => Record<string, NodeViewConstructor>;
  };
};

interface FragmentArgs {
  title: string | null;
  createdOn: string | null;
  content: string | null;
}

export class Fragment {
  content: SafeString | null;
  createdOn: string | null;
  title: string | null;

  constructor({ title, createdOn, content }: FragmentArgs) {
    this.content = optionMapOr(null, htmlSafe, content);
    this.createdOn = dateValue(createdOn ?? undefined);
    this.title = title;
  }
}
