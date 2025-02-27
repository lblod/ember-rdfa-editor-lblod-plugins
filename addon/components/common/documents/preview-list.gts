import Component from '@glimmer/component';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import Preview from './preview';
import { PreviewableDocument } from './types';

interface Sig<Doc extends PreviewableDocument> {
  Args: {
    docs: Doc[];
    onInsert: (toInsert: Doc) => void;
    isFavourite?: (doc: Doc) => boolean;
    toggleFavourite?: (doc: Doc) => void;
  };
  Element: HTMLDivElement;
}

export default class PreviewList<
  Doc extends PreviewableDocument,
> extends Component<Sig<Doc>> {
  <template>
    {{#if @docs.length}}
      <AuList as |Item|>
        {{#each @docs as |doc|}}
          <Item>
            <Preview
              @doc={{doc}}
              @onInsert={{@onInsert}}
              @isFavourite={{@isFavourite}}
              @toggleFavourite={{@toggleFavourite}}
            />
          </Item>
        {{/each}}
      </AuList>
    {{/if}}
  </template>
}
