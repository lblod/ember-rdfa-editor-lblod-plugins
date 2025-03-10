import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import { createDateVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/actions/create-date-variable';

type Args = {
  controller: SayController;
  templateMode?: boolean;
};

export default class DateInsertVariableComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label?: string;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    const defaultLabel = this.intl.t('variable.date.label', {
      locale: this.documentLanguage,
    });
    const label = this.label ?? defaultLabel;

    const node = createDateVariable({
      schema: this.schema,
      label,
    });

    this.label = undefined;
    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }
}
