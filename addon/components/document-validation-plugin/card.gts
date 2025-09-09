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
import { eq } from 'ember-truth-helpers';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';

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

    const { propertiesWithErrors, actions } = this.validationState;
    if (!propertiesWithErrors) return undefined;

    const documentValidationErrors = propertiesWithErrors.map((property) => {
      const action = actions.find(
        (action) => property?.shape === action.shaclRule,
      );
      return {
        ...property,
        action,
      };
    });
    return documentValidationErrors;
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
  get status() {
    if (!this.validationState?.report) return 'not-run';
    if (this.documentValidationErrors?.length === 0) {
      if (this.propertiesWithoutErrors?.length === 0) return 'no-matches';
      return 'valid';
    }
    return 'invalid';
  }
  get isSuccesslike() {
    return ['valid', 'no-matches'].includes(this.status);
  }

  doActionAndTriggerValidation = async (
    action: (controller: SayController, report: ValidationReport) => void,
  ) => {
    action(this.controller, this.validationState?.report as ValidationReport);
    const pluginState = documentValidationPluginKey.getState(
      this.controller.mainEditorView.state,
    );
    if (!pluginState) return;
    const { validationCallback } = pluginState;
    await validationCallback(
      this.controller.mainEditorView,
      this.controller.htmlContent,
    );
  };

  oldVal: typeof this.documentValidationErrors;

  dedupe = (val: typeof this.documentValidationErrors) => {
    if (this.myCompare(val, this.oldVal)) {
      return this.oldVal;
    } else {
      this.oldVal = val;
      return val;
    }
  };

  myCompare = (
    val1: typeof this.documentValidationErrors,
    val2: typeof this.documentValidationErrors,
  ) => {
    if (!val1?.length) return false;
    if (val1.length !== val2?.length) return false;
    for (let i = 0; i < val1.length; i++) {
      if (
        !val1 ||
        !val2 ||
        !val1[i] ||
        !val2[i] ||
        val1[i].shape !== val2[i].shape
      )
        return false;
    }
    return true;
  };

  <template>
    <AuCard
      @flex={{true}}
      @divided={{true}}
      @isOpenInitially={{true}}
      @expandable={{true}}
      @shadow={{true}}
      @size='small'
      class={{if
        this.isSuccesslike
        'say-document-validation__card-valid'
        'say-document-validation__card-invalid'
      }}
      as |c|
    >
      <c.header>
        <p class='au-u-medium au-u-h6'>
          {{#if (eq this.status 'valid')}}
            {{t 'document-validation-plugin.valid-document-title'}}
          {{else if (eq this.status 'invalid')}}
            {{t 'document-validation-plugin.invalid-document-title'}}
          {{else if (eq this.status 'not-run')}}
            {{t 'document-validation-plugin.document-not-validated-title'}}
          {{else if (eq this.status 'no-matches')}}
            {{t 'document-validation-plugin.no-matching-rules'}}
          {{/if}}
        </p>
      </c.header>
      <c.content>
        <div>
          {{#each (this.dedupe this.documentValidationErrors) as |error|}}
            <div class='say-document-validation__error-container'>
              <AuIcon
                @icon={{CloseFilledIcon}}
                @size='large'
                @ariaHidden={{true}}
                class='say-document-validation__icon-error au-u-margin-right-small'
              />
              <div>
                {{error.message}}
                <AuButton
                  class='au-u-padding-left-none au-u-padding-right-none'
                  @icon={{ExternalLinkIcon}}
                  @skin='link'
                  title={{error.subject}}
                  {{on 'click' (fn this.goToSubject error.subject)}}
                >{{t 'document-validation-plugin.see-related-node'}}</AuButton>
                {{#if error.action}}
                  <AuButton
                    class='au-u-padding-left-none au-u-padding-right-none'
                    @icon={{ExternalLinkIcon}}
                    @skin='link'
                    title={{error.subject}}
                    {{on
                      'click'
                      (fn this.doActionAndTriggerValidation error.action.action)
                    }}
                  >{{error.action.buttonTitle}}</AuButton>
                {{/if}}
              </div>
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
        </div>
      </c.content>

    </AuCard>
  </template>
}
