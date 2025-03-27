import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import { createClassicLocationVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/actions/create-classic-location-variable';

export type LocationInsertOptions = {
  endpoint: string;
};

type Args = {
  controller: SayController;
  options: LocationInsertOptions;
  templateMode?: boolean;
};

export default class LocationInsertComponent extends Component<Args> {
  @tracked label?: string;

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

  get endpoint() {
    return this.args.options.endpoint;
  }

  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    const placeholder = this.intl.t('variable.location.label', {
      locale: this.documentLanguage,
    });

    const label = this.label ?? placeholder;

    const node = createClassicLocationVariable({
      schema: this.schema,
      label,
      source: this.endpoint,
    });

    this.label = undefined;
    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }
}
