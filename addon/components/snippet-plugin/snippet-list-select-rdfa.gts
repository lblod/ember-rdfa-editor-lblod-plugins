import { TemplateOnlyComponent } from '@ember/component/template-only';
import { SayController } from '@lblod/ember-rdfa-editor';
import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { type SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import SnippetListSelect from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list-select';

interface Sig {
  Args: {
    controller: SayController;
    config: SnippetPluginConfig;
    node: ResolvedPNode;
  };
}

/** @deprecated Use snippet-list-select directly */
const SnippetListSelectRdfaComponent: TemplateOnlyComponent<Sig> = <template>
  <SnippetListSelect
    @controller={{@controller}}
    @config={{@config}}
    @node={{@node}}
  />
</template>;

/** @deprecated Use snippet-list-select directly */
export default SnippetListSelectRdfaComponent;
