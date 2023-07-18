import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
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
    if (this.controller.inEmbeddedView) {
      return false;
    }
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.controller.schema.nodes.variable
    ) {
      return false;
    } else {
      const variable = findParentNodeOfType(
        this.controller.schema.nodes.variable,
      )(selection);
      return !variable;
    }
  }
}
