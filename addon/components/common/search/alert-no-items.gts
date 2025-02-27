import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import AuAlert, {
  AuAlertSignature,
} from '@appuniversum/ember-appuniversum/components/au-alert';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';

interface Sig {
  Args: {
    fullSize?: boolean;
  };
  Element: AuAlertSignature['Element'];
}

const AlertNoItems: TemplateOnlyComponent<Sig> = <template>
  <AuAlert
    @title={{t 'common.search.no-results'}}
    @skin='warning'
    @icon={{CrossIcon}}
    @size={{if @fullSize undefined 'small'}}
    @closable={{false}}
    class={{unless @fullSize 'au-u-margin-small'}}
    ...attributes
  />
</template>;

export default AlertNoItems;
