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
import removeQuotes from '@lblod/ember-rdfa-editor-lblod-plugins/utils/remove-quotes';
import t from 'ember-intl/helpers/t';
import type { ShaclValidationReport } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-validation-plugin';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

interface Sig {
  Args: {
    controller: SayController;
  };
}

export default class DocumentValidationPluginCard extends Component<Sig> {
  get documentValidationErrors() {
    const { report } = documentValidationPluginKey.getState(
      this.controller.mainEditorView.state,
    );
    if (!report) return undefined;
    return shaclReportToErrorArray(report);
  }
  get propertiesWithoutErrors() {
    const { propertiesWithoutErrors } = documentValidationPluginKey.getState(
      this.controller.mainEditorView.state,
    );
    return propertiesWithoutErrors;
  }
  get controller() {
    return this.args.controller;
  }
  goToSubject = (subject: string) => {
    const succesful = this.controller.doCommand(
      selectNodeBySubject({ subject }),
      {
        view: this.controller.mainEditorView,
      },
    );
    if (!succesful) {
      this.setStatusMessage({
        type: 'info',
        message: `Node with subject ${subject} not found`,
      });
    }
    this.controller.focus();
  };
  setStatusMessage = (statusMessage) => {
    console.log(statusMessage);
  };
  get isValidDocument() {
    return this.documentValidationErrors?.length === 0;
  }
  <template>
    {{#if this.documentValidationErrors}}
      <AuCard
        @flex={{true}}
        @divided={{true}}
        @isOpenInitially={{true}}
        @expandable={{true}}
        @shadow={{true}}
        @size='small'
        class='say-document-validation__card'
        as |c|
      >
        <c.header>
          <p class='au-u-medium au-u-h6'>
            {{#if this.isValidDocument}}
              {{t 'document-validation-plugin.valid-document-title'}}
            {{else}}
              {{t 'document-validation-plugin.invalid-document-title'}}
            {{/if}}
          </p>
        </c.header>
        <c.content>
          <p class='au-u-medium au-u-para-small'>{{t
              'document-validation-plugin.description'
            }}</p>
          {{#each this.propertiesWithoutErrors as |property|}}
            <div class='say-document-validation__error-container'>
              <AuIcon
                @icon={{CheckFilledIcon}}
                @size='large'
                @ariaHidden={{true}}
                class='say-document-validation__icon-success au-u-margin-right-small'
              />
              {{property.message}}
            </div>
          {{/each}}
          {{#each this.documentValidationErrors as |error|}}
            <div class='say-document-validation__error-container'>
              <AuIcon
                @icon={{CloseFilledIcon}}
                @size='large'
                @ariaHidden={{true}}
                class='say-document-validation__icon-error au-u-margin-right-small'
              />
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
        </c.content>

      </AuCard>
    {{/if}}
  </template>
}

function shaclReportToErrorArray(report: ShaclValidationReport) {
  let errorArray = [];
  const factory = new SayDataFactory();
  for (const r of report.results) {
    const match = [
      ...r.dataset.match(
        r.sourceShape,
        factory.namedNode('http://www.w3.org/ns/shacl#resultMessage'),
      ),
    ][0];
    errorArray.push({
      message: removeQuotes(match.object.value),
      subject: r.focusNode?.value,
    });
  }
  return errorArray;
}
