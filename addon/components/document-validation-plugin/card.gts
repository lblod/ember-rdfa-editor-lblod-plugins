import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import { documentValidationPluginKey } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-validation-plugin';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { CircleXIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-x';
import { CircleCheckIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-check';
import { selectNodeBySubject } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/select-node-by-subject';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import removeQuotes from '@lblod/ember-rdfa-editor-lblod-plugins/utils/remove-quotes';

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
  <template>
    {{#if this.documentValidationErrors}}
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
          Document Validation
        </c.header>
        <c.content>
          {{#each this.propertiesWithoutErrors as |property|}}
            <div class='say-document-validation__error-container'>
              <AuIcon
                @icon={{CircleCheckIcon}}
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
                @icon={{CircleXIcon}}
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
              >See related node</AuButton>
            </div>
          {{/each}}
        </c.content>

      </AuCard>
    {{/if}}
  </template>
}

function shaclReportToErrorArray(report) {
  let errorArray = [];
  for (const r of report.results) {
    const shapeId = r.sourceShape.id;
    for (let [_, quad] of r.dataset._quads) {
      if (
        quad._subject?.id === shapeId &&
        quad._predicate?.id === 'http://www.w3.org/ns/shacl#resultMessage'
      ) {
        errorArray.push({
          message: removeQuotes(quad._object.id),
          subject: r.focusNode.value,
        });
        break;
      }
    }
  }
  return errorArray;
}
