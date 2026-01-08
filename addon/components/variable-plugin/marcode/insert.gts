import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import t from 'ember-intl/helpers/t';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import { createCodelistVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/actions/create-codelist-variable';
import { hardcodedMarcodeList } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/marcode';

type Sig = {
  Args: {
    controller: SayController;
    templateMode?: boolean;
  };
};

export default class MarcodeInsertComponent extends Component<Sig> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  insert() {
    const defaultLabel = this.intl.t('variable.marcode.label', {
      locale: this.documentLanguage,
    });
    const label = defaultLabel;

    const node = createCodelistVariable({
      schema: this.schema,
      // It's not clear if this should always be single, or whether we need to add a way to set it
      selectionStyle: 'single',
      codelist: 'http://example.org/this/doesnt/exist/yet',
      source: 'https://data.lblod.info/sparql',
      // This list is huge, but this hack also seems to be temporary... Maybe we should keep the
      // list in code instead of in the doc?
      hardcodedOptionList: hardcodedMarcodeList,
      label,
    });
    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }

  <template>
    <li class='au-c-list__item'>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        {{on 'click' this.insert}}
      >
        {{t 'variable.marcode.insert'}}
      </AuButton>
    </li>
  </template>
}
