import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuNativeInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/au-native-input';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { TemplateOnlyComponent } from '@ember/component/template-only';

interface Sig {
  Args: {
    label: string;
    updateLabel: (event: InputEvent) => void;
  };
}

const LabelInput: TemplateOnlyComponent<Sig> = <template>
  <AuLabel for='label'>
    {{t 'variable-plugin.label'}}
  </AuLabel>
  <AuNativeInput
    id='label'
    placeholder={{t 'variable-plugin.labelPlaceholder'}}
    @type='text'
    @width='block'
    value={{@label}}
    {{on 'input' @updateLabel}}
  />
</template>;

export default LabelInput;
