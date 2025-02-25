import { TemplateOnlyComponent } from '@ember/component/template-only';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import { Snippet } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import SnippetPreview from './snippet-preview';

interface Sig {
  Args: {
    snippets: Snippet[];
    onInsert: (content: string, title: string) => void;
  };
}

const SnippetList: TemplateOnlyComponent<Sig> = <template>
  {{#if @snippets.length}}
    <AuList as |Item|>
      {{#each @snippets as |snippet|}}
        <Item>
          <SnippetPreview @snippet={{snippet}} @onInsert={{@onInsert}} />
        </Item>
      {{/each}}
    </AuList>
  {{/if}}
</template>;

export default SnippetList;
