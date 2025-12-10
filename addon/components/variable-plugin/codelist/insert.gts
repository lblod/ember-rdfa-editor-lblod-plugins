import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeList,
  fetchCodeListsByPublisher,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { trackedFunction } from 'reactiveweb/function';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import PowerSelect from 'ember-power-select/components/power-select';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { not } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import LabelInput from '../utils/label-input';
import { createCodelistVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/actions/create-codelist-variable';

export type CodelistInsertOptions = {
  publisher?: string;
  endpoint: string;
};

type Args = {
  controller: SayController;
  options: CodelistInsertOptions;
  templateMode?: boolean;
};

interface SelectStyle {
  label: string;
  value: 'single' | 'multi';
}

export default class CodelistInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked selectedCodelist?: CodeList;
  @tracked label: string = '';
  @tracked selectedStyleValue: 'single' | 'multi' = 'single';

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get publisher() {
    return this.args.options.publisher;
  }

  get endpoint() {
    return this.args.options.endpoint;
  }

  get selectionStyles() {
    const singleSelect = {
      label: this.intl.t('variable.codelist.single-select'),
      value: 'single',
    } as const;
    const multiSelect = {
      label: this.intl.t('variable.codelist.multi-select'),
      value: 'multi',
    } as const;
    return [singleSelect, multiSelect];
  }

  get selectedStyle() {
    return this.selectionStyles.find(
      (style) => style.value === this.selectedStyleValue,
    );
  }

  codelistData = trackedFunction(this, async () => {
    return fetchCodeListsByPublisher(this.endpoint, this.publisher);
  });

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    const codelistResource = this.selectedCodelist?.uri;
    if (!codelistResource) {
      return;
    }
    const label =
      this.label ??
      this.selectedCodelist?.label ??
      this.intl.t('variable.codelist.label', {
        locale: this.documentLanguage,
      });
    const source = this.endpoint;
    const node = createCodelistVariable({
      schema: this.schema,
      selectionStyle: this.selectedStyleValue,
      codelist: codelistResource,
      source,
      label: label ?? this.selectedCodelist?.label,
    });

    this.label = '';
    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }

  @action
  selectCodelist(codelist: CodeList) {
    this.selectedCodelist = codelist;
  }

  @action
  selectStyle(style: SelectStyle) {
    this.selectedStyleValue = style.value;
  }

  <template>
    {{#if this.codelistData.value}}
      <PowerSelect
        @allowClear={{false}}
        @searchEnabled={{true}}
        @searchField='label'
        @options={{this.codelistData.value}}
        @selected={{this.selectedCodelist}}
        @onChange={{this.selectCodelist}}
        as |codelist|
      >
        {{codelist.label}}
      </PowerSelect>
      <PowerSelect
        @allowClear={{false}}
        @searchEnabled={{false}}
        @options={{this.selectionStyles}}
        @selected={{this.selectedStyle}}
        @onChange={{this.selectStyle}}
        as |style|
      >
        {{style.label}}
      </PowerSelect>
      <AuFormRow>
        <LabelInput @label={{this.label}} @updateLabel={{this.updateLabel}} />
      </AuFormRow>
      <AuButton
        {{on 'click' this.insert}}
        @disabled={{not this.selectedCodelist}}
      >
        {{t 'variable-plugin.button'}}
      </AuButton>
    {{/if}}
  </template>
}
