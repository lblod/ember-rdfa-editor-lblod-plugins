import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import BesluitTopicSelect from '@lblod/ember-rdfa-editor-lblod-plugins/components/besluit-topic-plugin/besluit-topic-select';
import type { BesluitTopic } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/fetchBesluitTopics';

interface BesluitTopicFieldSig {
  Args: {
    topics?: BesluitTopic[];
    selected?: BesluitTopic[];
    onChange: (topics: BesluitTopic[]) => void;
    isError?: boolean;
    renderInPlace?: boolean;
    disabled?: boolean;
  };
  Element: HTMLDivElement;
}

const BesluitTopicField: TemplateOnlyComponent<BesluitTopicFieldSig> =
  <template>
    <div ...attributes>
      <AuLabel>
        {{t 'besluit-topic-plugin.dt'}}
      </AuLabel>
      {{#if @isError}}
        <AuAlert @skin='error' @title={{t 'besluit-topic-plugin.error-title'}}>
          <p>{{t 'besluit-topic-plugin.error-short'}}</p>
        </AuAlert>
      {{else if @topics}}
        <BesluitTopicSelect
          @besluitTopics={{@topics}}
          @selected={{@selected}}
          @onchange={{@onChange}}
          @renderInPlace={{@renderInPlace}}
          @disabled={{@disabled}}
        />
      {{else}}
        <AuLoader @hideMessage={{true}}>{{t 'common.loading'}}</AuLoader>
      {{/if}}
    </div>
  </template>;

export default BesluitTopicField;
