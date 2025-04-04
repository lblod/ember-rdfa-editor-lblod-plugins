import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import PowerSelect from 'ember-power-select/components/power-select';
import { v4 as uuidv4 } from 'uuid';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { type BesluitType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/fetchBesluitTypes';

interface Sig {
  Args: {
    fieldNameTranslation: string;
    besluitTypes: BesluitType[];
    selected?: BesluitType;
    showWarningWhenEmpty: boolean;
    onchange: (selected: BesluitType) => void;
  };
  Element: HTMLDivElement;
}

export default class BesluitTypePluginBesluitTypeSelectComponent extends Component<Sig> {
  @tracked besluitTypes;

  constructor(parent: unknown, args: Sig['Args']) {
    super(parent, args);
    this.besluitTypes = this.args.besluitTypes.sort((a, b) =>
      a.label > b.label ? 1 : -1,
    );
  }

  get showWarning() {
    return this.args.showWarningWhenEmpty && !this.args.selected;
  }

  search = (term: string) => {
    const lowerTerm = term.toLowerCase();
    return this.args.besluitTypes.filter((besluitType) =>
      besluitType.label.toLowerCase().includes(lowerTerm),
    );
  };

  <template>
    <div ...attributes>
      {{#let (uuidv4) as |id|}}
        <AuLabel for={{id}}>
          {{t @fieldNameTranslation}}
        </AuLabel>
        <PowerSelect
          id={{id}}
          @renderInPlace={{true}}
          @searchEnabled={{true}}
          @searchMessage={{t 'besluit-type-plugin.search-message'}}
          @noMatchesMessage={{t 'besluit-type-plugin.no-matches-message'}}
          @search={{this.search}}
          @options={{this.besluitTypes}}
          @selected={{@selected}}
          @onChange={{@onchange}}
          as |besluitType|
        >
          {{besluitType.label}}
        </PowerSelect>
      {{/let}}
      <p class='au-u-muted au-u-margin-tiny au-u-margin-bottom-small'>
        {{@selected.definition}}
      </p>
      {{#if this.showWarning}}
        <AuAlert
          @icon={{AlertTriangleIcon}}
          @title={{t 'besluit-type-plugin.alert-title'}}
          @skin='warning'
          @size='small'
          class='au-u-margin-bottom-none au-u-margin-top-small'
        >
          <p>{{t 'besluit-type-plugin.alert-body'}}</p>
        </AuAlert>
      {{/if}}
    </div>
  </template>
}
