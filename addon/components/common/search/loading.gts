import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';

interface Sig {}

const SearchLoading: TemplateOnlyComponent<Sig> = <template>
  <AuLoader @hideMessage={{true}}>
    {{t 'common.search.loading'}}
  </AuLoader>
</template>;

export default SearchLoading;
