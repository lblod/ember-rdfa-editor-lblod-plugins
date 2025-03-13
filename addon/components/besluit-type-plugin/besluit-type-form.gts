import Component from '@glimmer/component';
import { type BesluitType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/fetchBesluitTypes';
import BesluitTypeSelect from '@lblod/ember-rdfa-editor-lblod-plugins/components/besluit-type-plugin/besluit-type-select';
import { type BesluitTypeInstance } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/besluit-type-instances';

interface Sig {
  Args: {
    types: BesluitType[];
    selectedType?: BesluitTypeInstance;
    setType: (selected: BesluitTypeInstance) => void;
  };
  Element: HTMLDivElement;
}

export default class BesluitTypePluginBesluitTypeSelectComponent extends Component<Sig> {
  updateParentType = (selected: BesluitType) => {
    this.args.setType({ parent: selected });
  };

  updateSubType = (selected: BesluitType) => {
    if (this.args.selectedType) {
      this.args.setType({
        parent: this.args.selectedType.parent,
        subType: selected,
      });
    }
  };

  updateSubSubType = (selected: BesluitType) => {
    if (this.args.selectedType) {
      this.args.setType({
        parent: this.args.selectedType.parent,
        subType: this.args.selectedType.subType,
        subSubType: selected,
      });
    }
  };

  <template>
    <div ...attributes>
      <BesluitTypeSelect
        @besluitTypes={{@types}}
        @onchange={{this.updateParentType}}
        @selected={{@selectedType.parent}}
        @showWarningWhenEmpty={{false}}
      />
      {{#if @selectedType.parent.subTypes.length}}
        <BesluitTypeSelect
          @besluitTypes={{@selectedType.parent.subTypes}}
          @onchange={{this.updateSubType}}
          @selected={{@selectedType.subType}}
          @showWarningWhenEmpty={{true}}
        />
      {{/if}}
      {{#if @selectedType.subType.subTypes.length}}
        <BesluitTypeSelect
          @besluitTypes={{@selectedType.subType.subTypes}}
          @onchange={{this.updateSubSubType}}
          @selected={{@selectedType.subSubType}}
          @showWarningWhenEmpty={{true}}
        />
      {{/if}}
    </div>
  </template>
}
