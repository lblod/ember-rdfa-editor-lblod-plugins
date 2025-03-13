import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didUpdate from '@ember/render-modifiers/modifiers/did-update';
import { trackedFunction } from 'reactiveweb/function';
import t from 'ember-intl/helpers/t';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';
import { MailIcon } from '@appuniversum/ember-appuniversum/components/icons/mail';
import { CircleXIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-x';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { SayController } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import fetchBesluitTypes from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/fetchBesluitTypes';
import { BesluitTypePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import { RDF } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getCurrentBesluitRange,
  getCurrentBesluitURI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import {
  BesluitTypeInstance,
  checkBesluitTypeInstance,
  isValidTypeChoice,
  mostSpecificBesluitType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/besluit-type-instances';
import BesluitTypeForm from '@lblod/ember-rdfa-editor-lblod-plugins/components/besluit-type-plugin/besluit-type-form';

type Args = {
  controller: SayController;
  options: BesluitTypePluginOptions;
};

export default class EditorPluginsToolbarDropdownComponent extends Component<Args> {
  @tracked selectedTypeInstance?: BesluitTypeInstance;
  @tracked existingInstance?: BesluitTypeInstance;
  @tracked cardExpanded = false;

  get controller() {
    return this.args.controller;
  }

  types = trackedFunction(this, async () => {
    const types = await fetchBesluitTypes(
      this.args.options.classificatieUri,
      this.args.options.endpoint,
    );
    return types;
  });

  get currentBesluitRange() {
    return getCurrentBesluitRange(this.controller);
  }

  get currentBesluitURI() {
    return getCurrentBesluitURI(this.controller);
  }

  get showCard() {
    return !!this.currentBesluitRange;
  }

  get selectedType() {
    return (
      this.selectedTypeInstance &&
      mostSpecificBesluitType(this.selectedTypeInstance)
    );
  }

  toggleCard = () => {
    this.cardExpanded = !this.cardExpanded;
  };

  setType = (type: BesluitTypeInstance) => {
    this.selectedTypeInstance = type;
    this.insertIfValid();
  };

  updateBesluitTypes = () => {
    if (!this.types.isFinished || !this.currentBesluitRange) {
      return;
    }
    if (!this.types.value) {
      console.warn('Request for besluit types failed');
      return;
    }
    const typeInstance = checkBesluitTypeInstance(
      this.controller.mainEditorState,
      this.types.value,
    );
    if (typeInstance) {
      this.existingInstance = typeInstance;
      this.selectedTypeInstance = typeInstance;
      this.cardExpanded = false;
    } else {
      this.cardExpanded = true;
    }
  };

  insertIfValid() {
    const resource = this.currentBesluitURI;
    if (
      this.selectedTypeInstance &&
      resource &&
      isValidTypeChoice(this.selectedTypeInstance)
    ) {
      this.cardExpanded = false;
      if (this.existingInstance) {
        this.controller.doCommand(
          removeProperty({
            resource,
            property: {
              predicate: RDF('type').full,
              object: sayDataFactory.namedNode(
                mostSpecificBesluitType(this.existingInstance).uri,
              ),
            },
          }),
          { view: this.controller.mainEditorView },
        );
      }
      this.controller.doCommand(
        addProperty({
          resource,
          property: {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(
              mostSpecificBesluitType(this.selectedTypeInstance).uri,
            ),
          },
        }),
        { view: this.controller.mainEditorView },
      );
    }
  }

  <template>
    <div
      {{didUpdate this.updateBesluitTypes @controller.mainEditorState}}
      {{didUpdate this.updateBesluitTypes this.types.value}}
    >
      {{#if this.showCard}}
        {{#if this.types.isError}}
          <AuPill
            @skin='error'
            @icon={{CircleXIcon}}
            @iconAlignment='left'
            class='au-c-pill--link besluit-toolbar-pill'
            {{on 'click' this.toggleCard}}
            title={{t 'besluit-type-plugin.insert-dt'}}
          >
            {{t 'besluit-type-plugin.error-short'}}
          </AuPill>
        {{else}}
          {{#if this.selectedType.label}}
            <AuPill
              @skin='link'
              {{on 'click' this.toggleCard}}
              title={{t 'besluit-type-plugin.insert-dt'}}
            >
              {{t 'besluit-type-plugin.dt'}}:
              {{this.selectedType.label}}
            </AuPill>
          {{else}}
            <AuPill
              @icon={{AlertTriangleIcon}}
              @iconAlignment='left'
              @skin='link'
              {{on 'click' this.toggleCard}}
              title={{t 'besluit-type-plugin.insert-dt'}}
            >
              {{t 'besluit-type-plugin.insert-dt'}}
            </AuPill>
          {{/if}}
        {{/if}}
      {{/if}}
      {{#if this.cardExpanded}}
        <AuModal
          @title={{t 'besluit-type-plugin.insert-dt'}}
          @closeModal={{this.toggleCard}}
          @modalOpen={{true}}
          class='au-c-modal--overflow'
          as |Modal|
        >
          <Modal.Body>
            {{#if this.types.isError}}
              <AuAlert
                @title={{t 'besluit-type-plugin.error-title'}}
                @skin='error'
                @icon={{CrossIcon}}
              >
                <p>
                  {{t 'besluit-type-plugin.error-first-body'}}
                  {{! template-lint-disable no-bare-strings  }}
                  <AuLinkExternal
                    href='mailto:gelinktnotuleren@vlaanderen.be'
                    @icon={{MailIcon}}
                    @iconAlignment='left'
                  >
                    GelinktNotuleren@vlaanderen.be
                  </AuLinkExternal>
                  {{! template-lint-enable no-bare-strings  }}
                  {{t 'besluit-type-plugin.error-rest-body'}}
                </p>
              </AuAlert>
            {{else if this.types.value}}
              <BesluitTypeForm
                @types={{this.types.value}}
                @selectedType={{this.selectedTypeInstance}}
                @setType={{this.setType}}
              />
            {{/if}}
          </Modal.Body>
        </AuModal>
      {{/if}}
    </div>
  </template>
}
