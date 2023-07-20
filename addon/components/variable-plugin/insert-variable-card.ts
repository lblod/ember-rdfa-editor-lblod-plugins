import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export type VariableConfig = {
  label: string;
  component: {
    path: string;
    options?: unknown;
  };
};

type Args = {
  controller: SayController;
  variableTypes: VariableConfig[];
};

export default class EditorPluginsInsertCodelistCardComponent extends Component<Args> {
  @tracked selectedVariable?: VariableConfig;

  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  @action
  updateSelectedVariable(variable: VariableConfig) {
    this.selectedVariable = variable;
  }

  get showCard() {
    return !this.controller.inEmbeddedView;
  }
}
