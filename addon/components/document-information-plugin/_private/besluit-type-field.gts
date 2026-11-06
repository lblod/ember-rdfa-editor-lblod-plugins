import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import BesluitTypeForm from '@lblod/ember-rdfa-editor-lblod-plugins/components/besluit-type-plugin/besluit-type-form';
import type { BesluitType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/fetchBesluitTypes';
import type { BesluitTypeInstance } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/besluit-type-instances';

interface BesluitTypeFieldSig {
  Args: {
    types?: BesluitType[] | null;
    selected?: BesluitTypeInstance;
    onChange: (selected: BesluitTypeInstance) => void;
    isError?: boolean;
    required?: boolean;
    renderInPlace?: boolean;
    disabled?: boolean;
  };
  Element: HTMLDivElement;
}

const BesluitTypeField: TemplateOnlyComponent<BesluitTypeFieldSig> = <template>
  <div ...attributes>
    {{#if @isError}}
      <AuAlert @skin='error' @title={{t 'besluit-type-plugin.error-title'}}>
        <p>{{t 'besluit-type-plugin.error-short'}}</p>
      </AuAlert>
    {{else if @types}}
      <BesluitTypeForm
        @types={{@types}}
        @selectedType={{@selected}}
        @setType={{@onChange}}
        @required={{@required}}
        @renderInPlace={{@renderInPlace}}
        @disabled={{@disabled}}
      />
    {{else}}
      <AuLoader @hideMessage={{true}}>{{t 'common.loading'}}</AuLoader>
    {{/if}}
  </div>
</template>;

export default BesluitTypeField;
