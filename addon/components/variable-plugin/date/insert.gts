import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import t from 'ember-intl/helpers/t';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { createDateVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/actions/create-date-variable';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';

type Sig = {
  Args: {
    controller: SayController;
    templateMode?: boolean;
  };
};

export default class DateInsertComponent extends Component<Sig> {
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
    const defaultLabel = this.intl.t('variable.date.label', {
      locale: this.documentLanguage,
    });
    const label = defaultLabel;

    const node = createDateVariable({
      schema: this.schema,
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
        {{t 'date-plugin.insert.date'}}
      </AuButton>
    </li>
  </template>
}
