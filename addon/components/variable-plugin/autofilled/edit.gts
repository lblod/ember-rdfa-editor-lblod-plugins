import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { NodeSelection, type SayController } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { v4 as uuidv4 } from 'uuid';
import IntlService from 'ember-intl/services/intl';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import AuNativeInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/au-native-input';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';

type Args = {
  controller: SayController;
};

export default class AutoFilledVariableInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label?: string;
  @tracked autofillKey?: string;
  @tracked convertToString?: boolean;

  get selectedVariable() {
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.controller.schema.nodes.autofilled_variable
    ) {
      const node = selection.node;
      this.autofillKey = node.attrs.autofillKey;
      console.log(node.attrs.convertToString);
      this.convertToString = node.attrs.convertToString === 'true';
      return {
        node: selection.node,
        pos: selection.from,
      };
    } else {
      return;
    }
  }

  get showCard() {
    return !!this.selectedVariable;
  }

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
  updateAutofillKey(event: InputEvent) {
    this.autofillKey = (event.target as HTMLInputElement).value;
  }

  @action
  updateConvertToString(value: boolean) {
    this.convertToString = value;
  }

  @action
  edit() {
    if (this.selectedVariable) {
      this.controller.withTransaction((tr) => {
        const position = this.selectedVariable?.pos as number;
        console.log(position);
        tr.setNodeAttribute(position, 'autofillKey', this.autofillKey);
        tr.setNodeAttribute(position, 'convertToString', this.convertToString);
        return tr;
      });
    }
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
          <AuFormRow>
            <AuLabel for='autofill_key'>
              {{t 'variable-plugin.autofill.autofillKey'}}
            </AuLabel>
            <AuNativeInput
              id='autofill_key'
              placeholder={{t
                'variable-plugin.autofill.autofillKeyPlaceholder'
              }}
              @type='text'
              @width='block'
              value={{this.autofillKey}}
              {{on 'input' this.updateAutofillKey}}
            />
          </AuFormRow>
          <AuFormRow>
            <AuCheckbox
              id='convert_to_string'
              @checked={{this.convertToString}}
              @onChange={{this.updateConvertToString}}
            >
              {{t 'variable-plugin.autofill.convertToString'}}
            </AuCheckbox>
          </AuFormRow>
          <AuButton {{on 'click' this.edit}}>
            {{t 'variable-plugin.button'}}
          </AuButton>
        </c.content>
      </AuCard>
    {{/if}}
  </template>
}
