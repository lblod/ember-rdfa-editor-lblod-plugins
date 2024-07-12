import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import { NotVisibleIcon } from '@appuniversum/ember-appuniversum/components/icons/not-visible';
import { SayController } from '@lblod/ember-rdfa-editor';
import Mark from '@lblod/ember-rdfa-editor/components/toolbar/mark';

interface Sig {
  Args: {
    controller: SayController;
  };
}

const Redact: TemplateOnlyComponent<Sig> = <template>
  <Mark
    @icon={{NotVisibleIcon}}
    @title={{t 'confidentiality-plugin.redact'}}
    @mark='redacted'
    @controller={{@controller}}
  />
</template>;
export default Redact;
