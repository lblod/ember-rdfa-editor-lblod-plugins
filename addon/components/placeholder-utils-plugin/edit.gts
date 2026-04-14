import Component from '@glimmer/component';
import { type ComponentLike } from '@glint/template';
import { NodeSelection, Node, SayController } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuNativeInput from '../au-native-input';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import checkEnterAndSubmit from '@lblod/ember-rdfa-editor-lblod-plugins/utils/check-enter-and-submit';
import { fn } from '@ember/helper';
import { not } from 'ember-truth-helpers';
import { trackedReset } from 'tracked-toolbox';

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

export default class PlaceholderUtilsEditCardComponent extends Component<Args> {
  @trackedReset({
    memo: 'selectedPlaceholderNode',
    update(component: PlaceholderUtilsEditCardComponent) {
      return component.selectedPlaceholderNode?.attrs.placeholderText;
    },
  })
  placeholderLabel: string | null = null;
  lastSelectedPlaceholder: Node | null = null;

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
      return null;
    }
  }
  get showCard() {
    return !!this.selectedPlaceholderNode;
  }
  updateLabelPlaceholder = (event: InputEvent) => {
    this.placeholderLabel = (event.target as HTMLInputElement).value;
  };
  updatePlaceholder = () => {
    const { selection } = this.controller.activeEditorState;
    this.controller.withTransaction((tr) => {
      return tr.setNodeAttribute(
        selection.$from.pos,
        'placeholderText',
        this.placeholderLabel,
      );
    });
  };

  <template>
    {{#if this.showCard}}
      <AuCard
        @flex={{true}}
        @divided={{true}}
        @isOpenInitially={{true}}
        @expandable={{true}}
        @shadow={{true}}
        @size='small'
        @disableAuContent={{true}}
        as |c|
      >
        <c.header>
          <AuHeading @level='3' @skin='6'>
            {{t 'placeholder-utils-plugin.card-title'}}
          </AuHeading>
        </c.header>
        <c.content>
          <AuFormRow>
            <AuLabel for='label'>
              {{t 'placeholder-utils-plugin.placeholder-text'}}
            </AuLabel>
            <AuNativeInput
              id='label'
              @type='text'
              @width='block'
              value={{this.placeholderLabel}}
              {{on 'input' this.updateLabelPlaceholder}}
              {{on 'keypress' (fn checkEnterAndSubmit this.updatePlaceholder)}}
            />
          </AuFormRow>
          <AuButton
            {{on 'click' this.updatePlaceholder}}
            class='au-u-margin-top'
            @disabled={{not this.placeholderLabel}}
          >
            {{t 'editor-plugins.utils.insert'}}
          </AuButton>
        </c.content>
      </AuCard>
    {{/if}}
  </template>
}
