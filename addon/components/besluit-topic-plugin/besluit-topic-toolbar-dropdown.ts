import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { findAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';
import { trackedFunction } from 'ember-resources/util/function';
import { ELI } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';
import { MailIcon } from '@appuniversum/ember-appuniversum/components/icons/mail';
import { BesluitTopicPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin';
import {
  BesluitTopic,
  fetchBesluitTopics,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/fetchBesluitTopics';
import {
  getCurrentBesluitRange,
  getCurrentBesluitURI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import {
  updateBesluitTopicResource,
  ELI_SUBJECT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/commands/update-besluit-topic-resource';
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

type Args = {
  controller: SayController;
  options: BesluitTopicPluginOptions;
};

export default class BesluitTopicToolbarDropdownComponent extends Component<Args> {
  MailIcon = MailIcon;
  CrossIcon = CrossIcon;
  AlertTriangleIcon = AlertTriangleIcon;

  /**
   * Actual besluit topic selected
   */
  @tracked besluitTopicSelected?: BesluitTopic[];
  @tracked previousBesluitTopics?: string[];

  /**
   * used to update selections since the other vars don't seem to work in octane
   */
  @tracked besluitTopics?: BesluitTopic[];

  @tracked cardExpanded = false;

  get controller() {
    return this.args.controller;
  }

  get doc() {
    return this.controller.mainEditorState.doc;
  }

  topics = trackedFunction(this, async () => {
    const result = await fetchBesluitTopics({
      config: { endpoint: this.args.options.endpoint },
    });

    return result.topics;
  });

  findBesluitTopicsByUris(
    uris: string[],
    topics = this.topics.value,
  ): BesluitTopic[] | undefined {
    if (!uris.length || !topics) return;

    return topics.filter((besluitTopic) => uris.includes(besluitTopic.uri));
  }

  @action
  updateBesluitTopic() {
    const currentBesluitURI = getCurrentBesluitURI(this.controller);

    if (!currentBesluitURI || !this.topics.value) {
      return;
    }

    const besluit = findAncestorOfType(
      this.controller.mainEditorState.selection,
      this.controller.schema.nodes['besluit'],
    );

    if (!besluit) {
      console.warn(
        `We have a besluit URI (${currentBesluitURI}), but can't find a besluit ancestor`,
      );
      return;
    }

    const outgoingBesluitTopics = getOutgoingTripleList(
      besluit.node.attrs,
      ELI(ELI_SUBJECT),
    );

    const besluitTopicsRelevant = outgoingBesluitTopics.filter(
      (topic) =>
        topic.object.termType === 'NamedNode' &&
        topic.object.value.includes(
          'https://data.vlaanderen.be/id/concept/BesluitThema/',
        ),
    );

    const outgoingUris = besluitTopicsRelevant.map(
      (topic) => topic.object.value,
    );

    const besluitTopics = this.findBesluitTopicsByUris(outgoingUris);

    if (besluitTopicsRelevant && besluitTopics) {
      this.previousBesluitTopics = outgoingUris;

      this.besluitTopics = besluitTopics;
      this.cardExpanded = false;
    } else {
      this.cardExpanded = true;
      this.besluitTopics = undefined;
    }
  }

  get showCard() {
    return !!getCurrentBesluitRange(this.controller);
  }

  @action
  upsertBesluitTopic(selected: BesluitTopic[]) {
    this.besluitTopics = selected;
    this.besluitTopicSelected = selected;

    this.insert();
  }

  insert() {
    const currentBesluitRange = getCurrentBesluitRange(this.controller);

    const resource =
      (currentBesluitRange &&
        'node' in currentBesluitRange &&
        (currentBesluitRange.node.attrs.subject as string)) ||
      undefined;

    if (this.besluitTopicSelected && resource) {
      this.cardExpanded = false;

      this.controller.doCommand(
        updateBesluitTopicResource({
          resource,
          previousTopics: this.previousBesluitTopics,
          newTopics: this.besluitTopicSelected,
        }),
        {
          view: this.args.controller.mainEditorView,
        },
      );

      this.previousBesluitTopics = this.besluitTopicSelected.map(
        (topic) => topic.uri,
      );
    }
  }

  @action
  toggleCard() {
    this.cardExpanded = !this.cardExpanded;
  }
}
