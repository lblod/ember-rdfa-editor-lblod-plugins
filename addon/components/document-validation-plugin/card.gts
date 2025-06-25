import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import { documentValidationPluginKey } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-validation-plugin';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { CloseFilledIcon } from '@appuniversum/ember-appuniversum/components/icons/close-filled';
import { CheckFilledIcon } from '@appuniversum/ember-appuniversum/components/icons/check-filled';
import { selectNodeBySubject } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/select-node-by-subject';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import t from 'ember-intl/helpers/t';
interface Sig {
  Args: {
    controller: SayController;
  };
}

export default class DocumentValidationPluginCard extends Component<Sig> {
  get controller() {
    return this.args.controller;
  }
  get validationState() {
    const state = documentValidationPluginKey.getState(
      this.controller.mainEditorState,
    );
    if (!state) {
      console.warn(
        'DocumentValidationPluginCard needs the documentValidation plugin to function. Is it configured?',
      );
      return undefined;
    }
    return state;
  }
  get documentValidationErrors() {
    if (!this.validationState) return [];
    const { propertiesWithErrors } = this.validationState;
    if (!propertiesWithErrors) return undefined;

    return propertiesWithErrors;
  }
  get propertiesWithoutErrors() {
    if (!this.validationState) return [];
    const { propertiesWithoutErrors } = this.validationState;
    return propertiesWithoutErrors;
  }
  goToSubject = (subject: string) => {
    this.controller.doCommand(selectNodeBySubject({ subject }), {
      view: this.controller.mainEditorView,
    });
    this.controller.focus();
  };
  get hasValidationRun() {
    return !!this.validationState?.report;
  }
  get isValidDocument() {
    return this.hasValidationRun && this.documentValidationErrors?.length === 0;
  }

  <template>
    <AuCard
      @flex={{true}}
      @divided={{true}}
      @isOpenInitially={{true}}
      @expandable={{true}}
      @shadow={{true}}
      @size='small'
      class={{if
        this.isValidDocument
        'say-document-validation__card-valid'
        'say-document-validation__card-invalid'
      }}
      as |c|
    >
      <c.header>
        <p class='au-u-medium au-u-h6'>
          {{#if this.hasValidationRun}}
            {{#if this.isValidDocument}}
              {{t 'document-validation-plugin.valid-document-title'}}
            {{else}}
              {{t 'document-validation-plugin.invalid-document-title'}}
            {{/if}}
          {{else}}
            {{t 'document-validation-plugin.document-not-validated-title'}}
          {{/if}}
        </p>
      </c.header>
      <c.content>
        <p class='au-u-medium au-u-para-small'>{{t
            'document-validation-plugin.description'
          }}</p>
        {{#each this.documentValidationErrors as |error|}}
          <div class='say-document-validation__error-container'>
            <div class='au-u-margin-right-small'>
              <AuIcon
                @icon={{CloseFilledIcon}}
                @size='large'
                @ariaHidden={{true}}
                class='say-document-validation__icon-error au-u-margin-right-small'
              />
            </div>
            {{error.message}}
            <AuButton
              class='au-u-padding-left-none au-u-padding-right-none'
              @icon={{ExternalLinkIcon}}
              @skin='link'
              title={{error.subject}}
              {{on 'click' (fn this.goToSubject error.subject)}}
            >{{t 'document-validation-plugin.see-related-node'}}</AuButton>
          </div>
        {{/each}}
        {{#each this.propertiesWithoutErrors as |property|}}
          <div class='say-document-validation__error-container'>
            <div class='au-u-margin-right-small'>
              <AuIcon
                @icon={{CheckFilledIcon}}
                @size='large'
                @ariaHidden={{true}}
                class='say-document-validation__icon-success'
              />
            </div>
            {{property.message}}
          </div>
        {{/each}}
      </c.content>

    </AuCard>
  </template>
}
