import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { hash } from '@ember/helper';
import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import type { SayController } from '@lblod/ember-rdfa-editor';
import { trackedFunction } from 'reactiveweb/function';
import type { BesluitTypePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import type { BesluitTopicPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin';
import fetchBesluitTypes from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/fetchBesluitTypes';
import {
  checkBesluitTypeInstance,
  isValidTypeChoice,
  type BesluitTypeInstance,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/besluit-type-instances';
import { setBesluitType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/set-besluit-type';
import {
  fetchBesluitTopics,
  type BesluitTopic,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/fetchBesluitTopics';
import { updateBesluitTopicResource } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/commands/update-besluit-topic-resource';
import { extractBesluitTopicUris } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/extract-besluit-topic-uris';
import {
  getCurrentBesluitRange,
  getCurrentBesluitURI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import BesluitTypeField from './_private/besluit-type-field';
import BesluitTopicField from './_private/besluit-topic-field';
import { WithBoundArgs } from '@glint/template';
import { not } from 'ember-truth-helpers';
import {
  BesluitTargetGroup,
  BesluitTargetGroupPluginOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-target-group-plugin/_private/types';
import { fetchBesluitTargetGroups } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-target-group-plugin/_private/queries';
import BesluitTargetGroupField from './_private/besluit-target-group-field';
import { extractBesluitTargetGroupUris } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-target-group-plugin/_private/extract-besluit-target-group-uris';
import { setBesluitTargetGroups } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-target-group-plugin/_private/set-besluit-target-groups';

interface Sig {
  Args: {
    controller: SayController;
    besluitTypeOptions?: BesluitTypePluginOptions;
    besluitTopicOptions?: BesluitTopicPluginOptions;
    besluitTargetGroupOptions?: BesluitTargetGroupPluginOptions;
    onSave?: () => void | Promise<void>;
    onCancel?: () => void;
    saveDisabled?: boolean;
    requireBesluitType?: boolean;
  };
  Blocks: {
    default: [
      {
        BesluitType: WithBoundArgs<
          typeof BesluitTypeField,
          | 'types'
          | 'selected'
          | 'onChange'
          | 'isError'
          | 'required'
          | 'renderInPlace'
          | 'disabled'
        >;
        BesluitTopic: WithBoundArgs<
          typeof BesluitTopicField,
          | 'topics'
          | 'selected'
          | 'onChange'
          | 'isError'
          | 'renderInPlace'
          | 'disabled'
        >;
        BesluitTargetGroup: WithBoundArgs<
          typeof BesluitTargetGroupField,
          | 'targetGroups'
          | 'selected'
          | 'onChange'
          | 'isError'
          | 'renderInPlace'
          | 'disabled'
        >;
      },
    ];
  };
}

export default class DocumentInformationModal extends Component<Sig> {
  @tracked stagedTypeInstance?: BesluitTypeInstance;
  @tracked stagedTopics?: BesluitTopic[];
  @tracked stagedTargetGroups?: BesluitTargetGroup[];

  get controller() {
    return this.args.controller;
  }

  get hasBesluit() {
    return !!getCurrentBesluitRange(this.controller);
  }

  get fetchedTypes() {
    return this.types.value ?? undefined;
  }

  get fetchedTopics() {
    return this.topics.value ?? undefined;
  }

  get fetchedTargetGroups() {
    return this.targetGroups.value ?? undefined;
  }

  get besluitTypeInstance(): BesluitTypeInstance | undefined {
    const types = this.fetchedTypes;
    if (!types) {
      return;
    }
    return (
      checkBesluitTypeInstance(this.controller.mainEditorState, types) ||
      undefined
    );
  }

  get selectedTypeInstance(): BesluitTypeInstance | undefined {
    return this.stagedTypeInstance ?? this.besluitTypeInstance;
  }

  get hasStagedType() {
    return this.stagedTypeInstance !== undefined;
  }

  get besluitTopics(): BesluitTopic[] | undefined {
    const topics = this.fetchedTopics;
    const uris = extractBesluitTopicUris(this.controller);
    if (!topics || !uris.length) {
      return;
    }
    return topics.filter((topic) => uris.includes(topic.uri));
  }

  get selectedTopics(): BesluitTopic[] | undefined {
    return this.stagedTopics ?? this.besluitTopics;
  }

  get hasStagedTopics() {
    return this.stagedTopics !== undefined;
  }

  get besluitTargetGroups(): BesluitTargetGroup[] | undefined {
    const targetGroups = this.fetchedTargetGroups;
    const uris = extractBesluitTargetGroupUris(this.controller);
    if (!targetGroups || !uris.length) {
      return;
    }
    return targetGroups.filter((topic) => uris.includes(topic.uri));
  }

  get selectedTargetGroups(): BesluitTargetGroup[] | undefined {
    return this.stagedTargetGroups ?? this.besluitTargetGroups;
  }

  get hasStagedTargetGroups() {
    return this.stagedTargetGroups !== undefined;
  }

  // default is true
  get requireBesluitType() {
    return this.args.requireBesluitType !== false && this.hasBesluit;
  }

  get saveDisabled() {
    if (this.args.saveDisabled) {
      return true;
    }
    if (!this.requireBesluitType) {
      return false;
    }
    const selectedType = this.selectedTypeInstance;
    if (!selectedType) {
      return true;
    }
    // An existing type may predate the current type hierarchy, so only
    // validate the choice when the user has actually changed it.
    return this.hasStagedType && !isValidTypeChoice(selectedType);
  }

  types = trackedFunction(this, async () => {
    if (!this.args.besluitTypeOptions) {
      throw new Error(
        '`@besluitTypeOptions` argument of `DocumentInformationModal` component is not configured',
      );
    }
    return fetchBesluitTypes(
      this.args.besluitTypeOptions.classificatieUri,
      this.args.besluitTypeOptions.endpoint,
    );
  });

  topics = trackedFunction(this, async () => {
    if (!this.args.besluitTopicOptions) {
      throw new Error(
        '`@besluitTopicOptions` argument of `DocumentInformationModal` component is not configured',
      );
    }
    const result = await fetchBesluitTopics({
      config: { endpoint: this.args.besluitTopicOptions.endpoint },
    });
    return result.topics;
  });

  targetGroups = trackedFunction(this, async () => {
    if (!this.args.besluitTargetGroupOptions) {
      throw new Error(
        '`@besluitTargetGroupOptions` argument of `DocumentInformationModal` component is not configured',
      );
    }
    const result = await fetchBesluitTargetGroups({
      config: this.args.besluitTargetGroupOptions,
    });
    return result;
  });

  setType = (type: BesluitTypeInstance) => {
    this.stagedTypeInstance = type;
  };

  setBesluitTopics = (selected: BesluitTopic[]) => {
    this.stagedTopics = selected;
  };

  setTargetGroups = (selected: BesluitTargetGroup[]) => {
    this.stagedTargetGroups = selected;
  };

  updateDocumentBesluitType() {
    this.controller.doCommand((state, dispatch) => {
      if (!this.selectedTypeInstance || !dispatch) {
        return false;
      }
      const { result, transaction } = setBesluitType(
        state,
        this.selectedTypeInstance,
      );
      if (result.every((ok) => ok)) {
        dispatch(transaction);
        return true;
      }
      return false;
    });
  }

  updateDocumentTopic() {
    const resource = getCurrentBesluitURI(this.controller);
    if (resource && this.selectedTopics) {
      this.controller.doCommand(
        updateBesluitTopicResource({
          resource,
          previousTopics: extractBesluitTopicUris(this.controller),
          newTopics: this.selectedTopics,
        }),
        {
          view: this.controller.mainEditorView,
        },
      );
    }
  }

  updateDocumentTargetGroups() {
    this.controller.doCommand((state, dispatch) => {
      if (!this.selectedTargetGroups || !dispatch) {
        return false;
      }
      const { result, transaction } = setBesluitTargetGroups(
        state,
        this.selectedTargetGroups,
      );
      if (result.every((ok) => ok)) {
        dispatch(transaction);
        return true;
      }
      return false;
    });
  }

  saveChanges = task(async () => {
    if (this.hasStagedType) {
      this.updateDocumentBesluitType();
      this.stagedTypeInstance = undefined;
    }
    if (this.hasStagedTopics) {
      this.updateDocumentTopic();
      this.stagedTopics = undefined;
    }
    if (this.hasStagedTargetGroups) {
      this.updateDocumentTargetGroups();
      this.stagedTargetGroups = undefined;
    }
    await this.args.onSave?.();
  });

  cancel = () => {
    this.stagedTypeInstance = undefined;
    this.stagedTopics = undefined;
    this.args.onCancel?.();
  };

  <template>
    <AuModal
      @title={{t 'document-information-plugin.modal-title'}}
      @modalOpen={{true}}
      @closeModal={{this.cancel}}
      as |Modal|
    >
      <Modal.Body>
        {{yield
          (hash
            BesluitType=(component
              BesluitTypeField
              types=this.fetchedTypes
              selected=this.selectedTypeInstance
              onChange=this.setType
              isError=this.types.isError
              required=this.requireBesluitType
              renderInPlace=false
              disabled=(not this.hasBesluit)
            )
            BesluitTopic=(component
              BesluitTopicField
              topics=this.fetchedTopics
              selected=this.selectedTopics
              onChange=this.setBesluitTopics
              isError=this.topics.isError
              renderInPlace=false
              disabled=(not this.hasBesluit)
            )
            BesluitTargetGroup=(component
              BesluitTargetGroupField
              targetGroups=this.fetchedTargetGroups
              selected=this.selectedTargetGroups
              onChange=this.setTargetGroups
              isError=this.targetGroups.isError
              renderInPlace=false
              disabled=(not this.hasBesluit)
            )
          )
        }}
      </Modal.Body>
      <Modal.Footer>
        <AuButton
          @loading={{this.saveChanges.isRunning}}
          @loadingMessage={{t 'common.loading'}}
          @disabled={{this.saveDisabled}}
          {{on 'click' (perform this.saveChanges)}}
        >
          {{t 'document-information-plugin.save'}}
        </AuButton>
        <AuButton
          @skin='secondary'
          @disabled={{this.saveChanges.isRunning}}
          {{on 'click' this.cancel}}
        >
          {{t 'document-information-plugin.cancel'}}
        </AuButton>
      </Modal.Footer>
    </AuModal>
  </template>
}
