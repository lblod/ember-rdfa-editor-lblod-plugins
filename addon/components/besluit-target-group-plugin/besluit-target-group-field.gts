import { TemplateOnlyComponent } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import { BesluitTargetGroup } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-target-group-plugin/types';
import Component from '@glimmer/component';
import { action } from '@ember/object';

interface Signature {
  Args: {
    targetGroups?: BesluitTargetGroup[];
    selected?: BesluitTargetGroup[];
    onChange: (targetGroups: BesluitTargetGroup[]) => void;
    isError?: boolean;
    renderInPlace?: boolean;
    disabled?: boolean;
  };
  Element: HTMLDivElement;
}

const BesluitTargetGroupField: TemplateOnlyComponent<Signature> = <template>
  <div ...attributes>
    <AuLabel>
      {{t 'besluit-target-group-plugin.label'}}
    </AuLabel>
    {{#if @isError}}
      <AuAlert
        @skin='error'
        @title={{t 'besluit-target-group-plugin.error-title'}}
      >
        <p>{{t 'besluit-target-group-plugin.error-short'}}</p>
      </AuAlert>
    {{else if @targetGroups}}
      <BesluitTargetGroupSelect
        @besluitTargetGroups={{@targetGroups}}
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

export default BesluitTargetGroupField;

type BesluitTargetGroupSelectSignature = {
  Args: {
    besluitTargetGroups: BesluitTargetGroup[];
    selected?: BesluitTargetGroup[];
    onchange: (targetGroups: BesluitTargetGroup[]) => void;
    renderInPlace?: boolean;
    disabled?: boolean;
  };
  Element: HTMLDivElement;
};

class BesluitTargetGroupSelect extends Component<BesluitTargetGroupSelectSignature> {
  @action
  search(term: string) {
    const lowerTerm = term.toLowerCase();

    return this.args.besluitTargetGroups.filter((targetGroup) =>
      targetGroup.label.toLowerCase().includes(lowerTerm),
    );
  }

  <template>
    <div ...attributes>
      <PowerSelectMultiple
        @searchEnabled={{true}}
        @searchMessage={{t 'common.search.type-to-search'}}
        @noMatchesMessage={{t 'common.search.no-results'}}
        @search={{this.search}}
        @options={{@besluitTargetGroups}}
        @selected={{@selected}}
        @onChange={{@onchange}}
        @renderInPlace={{@renderInPlace}}
        @disabled={{@disabled}}
        as |targetGroup|
      >
        <span title={{targetGroup.definition}}>
          {{targetGroup.label}}
        </span>
      </PowerSelectMultiple>
    </div>
  </template>
}
