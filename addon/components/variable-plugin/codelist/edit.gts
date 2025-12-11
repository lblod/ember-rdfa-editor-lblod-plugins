import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { eq, not } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import PowerSelect from 'ember-power-select/components/power-select';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  CodeListOptions,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { trackedFunction } from 'reactiveweb/function';
import {
  updateCodelistVariable,
  updateCodelistVariableLegacy,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/codelist-utils';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { tracked } from '@glimmer/tracking';

export type CodelistEditOptions = {
  endpoint: string;
};
type Sig = {
  Args: {
    controller: SayController;
    options: CodelistEditOptions;
  };
};

export default class CodelistEditComponent extends Component<Sig> {
  @tracked
  selectedCodelistOption?: CodeListOption | CodeListOption[];

  get controller() {
    return this.args.controller;
  }

  get isLegacyCodelist() {
    return (
      this.selectedCodelist?.node.type ===
      this.controller.schema.nodes.legacy_codelist
    );
  }

  get selectedCodelist() {
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      (selection.node.type === this.controller.schema.nodes.codelist ||
        selection.node.type === this.controller.schema.nodes.legacy_codelist)
    ) {
      const codelist = {
        node: selection.node,
        pos: selection.from,
      };
      return codelist;
    }
    return;
  }

  get source() {
    if (this.selectedCodelist) {
      const { node } = this.selectedCodelist;
      const source = node.attrs['source'] as Option<string>;
      if (source && source !== 'UNKNOWN') {
        return source;
      }
    }
    return this.args.options.endpoint;
  }

  get codelistUri() {
    if (this.selectedCodelist) {
      const { node } = this.selectedCodelist;
      const codelistUri = node.attrs['codelist'] as Option<string>;
      if (codelistUri) {
        return codelistUri;
      }
    }
    return;
  }

  get showCard() {
    return !!this.selectedCodelist;
  }

  get label() {
    return this.selectedCodelist?.node.attrs.label as string | undefined;
  }

  get schema() {
    return this.args.controller.schema;
  }

  codelistOptions = trackedFunction(this, async () => {
    let result: CodeListOptions | undefined;
    if (this.source && this.codelistUri) {
      result = await fetchCodeListOptions(this.source, this.codelistUri);
    }
    // This a workaround/hack to be able to reset the `selected` option after the `codelistOptions` change.
    // Normally we'd do this with a `trackedReset`, but this gave us `write-after-read` dev-errors at the time of writing this.
    // TODO: convert this back to a `trackedReset` (or an alternative) once possible.
    this.selectedCodelistOption = undefined;
    const codelistNode = this.selectedCodelist?.node;
    let multiSelect: boolean;
    const localSelectionStyle = this.selectedCodelist?.node.attrs
      .selectionStyle as string;
    if (localSelectionStyle) {
      multiSelect = localSelectionStyle === 'multi';
    } else {
      multiSelect = result?.type === MULTI_SELECT_CODELIST_TYPE;
    }
    if (
      !this.isLegacyCodelist &&
      codelistNode &&
      codelistNode.children.length > 0
    ) {
      const options = codelistNode.children.map((child) => ({
        uri: child.attrs['subject'],
        label: child.textContent,
      }));
      this.selectedCodelistOption = multiSelect ? options : options[0];
    } else {
      this.selectedCodelistOption = undefined;
    }

    return result;
  });

  get multiSelect() {
    const localStyle = this.selectedCodelist?.node.attrs
      .selectionStyle as string;
    if (localStyle) {
      return localStyle === 'multi';
    } else
      return this.codelistOptions.value?.type === MULTI_SELECT_CODELIST_TYPE;
  }

  @action
  insert() {
    if (!this.selectedCodelist || !this.selectedCodelistOption) {
      return;
    }
    if (this.isLegacyCodelist) {
      updateCodelistVariableLegacy(
        this.selectedCodelist,
        this.selectedCodelistOption,
        this.controller,
      );
    } else {
      updateCodelistVariable(
        this.selectedCodelist,
        this.selectedCodelistOption,
        this.controller,
      );
    }
  }

  @action
  updateCodelistOption(codelistOption: CodeListOption | CodeListOption[]) {
    this.selectedCodelistOption = codelistOption;
  }

  <template>
    {{#if this.showCard}}
      <AuCard
        @flex={{true}}
        @divided={{true}}
        @isOpenInitially={{true}}
        @expandable={{true}}
        @shadow={{true}}
        @size='small'
        as |c|
      >
        <c.header>
          <AuHeading @level='3' @skin='6'>
            {{t 'variable-plugin.enter-variable-value'}}
          </AuHeading>
        </c.header>
        <c.content>
          {{#if (eq this.codelistUri 'UNKNOWN')}}
            <AuAlert @icon={{AlertTriangleIcon}} @skin='warning'>
              {{t 'variable-plugin.unknown-codelist'}}
            </AuAlert>
          {{else}}
            <AuLabel for='codelist-select'>
              {{this.label}}
            </AuLabel>
            {{#if this.multiSelect}}
              <PowerSelectMultiple
                id='codelist-select'
                @allowClear={{false}}
                @searchEnabled={{true}}
                @searchField='label'
                @options={{this.codelistOptions.value.options}}
                @selected={{this.selectedCodelistOption}}
                @onChange={{this.updateCodelistOption}}
                as |option|
              >
                {{option.label}}
              </PowerSelectMultiple>
            {{else}}
              <PowerSelect
                id='codelist-select'
                @allowClear={{false}}
                @searchEnabled={{true}}
                @searchField='label'
                @options={{this.codelistOptions.value.options}}
                @selected={{this.selectedCodelistOption}}
                @onChange={{this.updateCodelistOption}}
                as |option|
              >
                {{option.label}}
              </PowerSelect>
            {{/if}}
            <AuButton
              {{on 'click' this.insert}}
              @disabled={{not this.selectedCodelistOption}}
            >
              {{t 'editor-plugins.utils.insert'}}
            </AuButton>
          {{/if}}
        </c.content>
      </AuCard>
    {{/if}}
  </template>
}
