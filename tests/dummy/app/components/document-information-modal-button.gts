import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { InfoCircleIcon } from '@appuniversum/ember-appuniversum/components/icons/info-circle';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import DocumentInformationModal from '@lblod/ember-rdfa-editor-lblod-plugins/components/document-information-plugin/document-information-modal';
import { BesluitTopicPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin';
import { BesluitTypePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';

interface Signature {
  Args: {
    controller: SayController;
    besluitTopicOptions: BesluitTopicPluginOptions;
    besluitTypeOptions: BesluitTypePluginOptions;
  };
}
export default class extends Component<Signature> {
  @tracked modalOpen = false;

  openModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    this.modalOpen = false;
  };
  <template>
    {{! template-lint-disable no-bare-strings }}
    <AuButton
      @icon={{InfoCircleIcon}}
      @skin='naked'
      {{on 'click' this.openModal}}
    >
      Document Information
    </AuButton>
    {{#if this.modalOpen}}
      <DocumentInformationModal
        @controller={{@controller}}
        @besluitTopicOptions={{@besluitTopicOptions}}
        @besluitTypeOptions={{@besluitTypeOptions}}
        @requireBesluitType={{true}}
        @onSave={{this.closeModal}}
        @onCancel={{this.closeModal}}
        as |DIM|
      >
        <DIM.BesluitType />
        <DIM.BesluitTopic />
      </DocumentInformationModal>
    {{/if}}
  </template>
}
