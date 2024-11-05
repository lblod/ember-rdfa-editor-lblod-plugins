import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { type SayController } from '@lblod/ember-rdfa-editor';
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
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import LabelInput from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/utils/label-input';

type Args = {
  controller: SayController;
};

export default class AutoFilledVariableInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked label: string = '';
  @tracked autofillKey?: string;
  @tracked convertToString?: boolean;

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
  insert() {
    const mappingSubject = `http://data.lblod.info/mappings/${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
    const variableId = uuidv4();

    const placeholder = this.intl.t('variable.autofilled.label', {
      locale: this.documentLanguage,
    });

    const label =
      this.label != '' ? this.label : this.autofillKey || placeholder;
    const node = this.schema.nodes.autofilled_variable.create(
      {
        subject: mappingSubject,
        rdfaNodeType: 'resource',
        __rdfaId: variableId,
        properties: [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(variableInstance),
          },
          {
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('autofilled'),
          },
          {
            predicate: EXT('content').full,
            object: sayDataFactory.contentLiteral(),
          },
        ],
        autofillKey: this.autofillKey,
        convertToString: this.convertToString,
      },

      this.schema.node('placeholder', {
        placeholderText: label,
      }),
    );
    this.label = '';

    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
  }
  <template>
    <AuFormRow>
      <LabelInput @label={{this.label}} @updateLabel={{this.updateLabel}} />
    </AuFormRow>
    <AuFormRow>
      <AuLabel for='autofill_key'>
        {{t 'variable-plugin.autofill.autofillKey'}}
      </AuLabel>
      <AuNativeInput
        id='autofill_key'
        placeholder={{t 'variable-plugin.autofill.autofillKeyPlaceholder'}}
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
    <AuButton {{on 'click' this.insert}}>
      {{t 'variable-plugin.button'}}
    </AuButton>
  </template>
}
