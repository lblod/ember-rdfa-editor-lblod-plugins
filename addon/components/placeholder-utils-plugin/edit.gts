import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { type ComponentLike } from '@glint/template';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';

type VariableComponentArgs = {
  Args: {
    Named: {
      controller: SayController;
    };
  };
};
export type VariableConfig = {
  label: string;
  component: ComponentLike<VariableComponentArgs>;
  options?: unknown;
};

type Args = {
  controller: SayController;
  variableTypes: VariableConfig[];
};

export default class EditorPluginsInsertCodelistCardComponent extends Component<Args> {
  @tracked labelPlaceholder?: string;

  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get selectedPlaceholderNode() {
    const { selection, schema } = this.controller.activeEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === schema.nodes.placeholder
    ) {
      return selection.node;
    } else {
      return;
    }
  }
  get showCard() {
    return !!this.selectedPlaceholderNode;
  }
  updateLabelPlaceholder = (event: InputEvent) => {
    this.labelPlaceholder = (event.target as HTMLInputElement).value;
  };
  updatePlaceholder = () => {
    const { selection } = this.controller.activeEditorState;
    this.controller.withTransaction((tr) => {
      return tr.setNodeAttribute(
        selection.$from.pos,
        'placeholderText',
        this.labelPlaceholder,
      );
    });
  };
  <template>
    {{#if this.showCard}}
      <AuCard
        @flex={{true}}
        @divided={{true}}
        @expandable={{false}}
        @shadow={{true}}
        @size='flush'
        as |c|
      >
        <c.header>
          Edit Placeholder
        </c.header>
        <c.content>
          <form class='au-c-form'>
            <AuLabel>
              {{t 'editor-plugins.roadsign-regulation.modal.filter.text'}}
            </AuLabel>
            <AuInput
              value={{this.labelPlaceholder}}
              {{on 'input' this.updateLabelPlaceholder}}
            />
            <AuButton {{on 'click' this.updatePlaceholder}}>
              {{t 'editor-plugins.utils.insert'}}
            </AuButton>

          </form>
        </c.content>
      </AuCard>
    {{/if}}
  </template>
}
