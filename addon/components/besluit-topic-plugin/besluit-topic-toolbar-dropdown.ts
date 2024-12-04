import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { trackedFunction } from 'reactiveweb/function';
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
  TOPIC_PREDICATE,
  TOPIC_PREDICATE_DEPRECATED,
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
  @tracked besluitTopicsSelected?: BesluitTopic[];
  @tracked previousBesluitTopics?: string[];

  @tracked cardExpanded = false;

  get controller() {
    return this.args.controller;
  }

  get doc() {
    return this.controller.mainEditorState.doc;
  }
  get decisionRange() {
    return getCurrentBesluitRange(this.controller);
  }

  get showCard() {
    return !!this.decisionRange;
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
    if (!this.topics.isFinished || !this.decisionRange) {
      return;
    }
    if (!this.topics.value) {
      console.warn('Request for besluit topics failed');
      return;
    }

    let outgoingBesluitTopics = getOutgoingTripleList(
      this.decisionRange.node.attrs,
      TOPIC_PREDICATE,
    );
    if (outgoingBesluitTopics.length === 0) {
      outgoingBesluitTopics = getOutgoingTripleList(
        this.decisionRange.node.attrs,
        TOPIC_PREDICATE_DEPRECATED,
      );
    }

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

      this.besluitTopicsSelected = besluitTopics;
    } else {
      this.besluitTopicsSelected = undefined;
    }
  }

  @action
  upsertBesluitTopic(selected: BesluitTopic[]) {
    this.besluitTopicsSelected = selected;

    const resource = getCurrentBesluitURI(this.controller);

    if (this.besluitTopicsSelected && resource) {
      this.controller.doCommand(
        updateBesluitTopicResource({
          resource,
          previousTopics: this.previousBesluitTopics,
          newTopics: this.besluitTopicsSelected,
        }),
        {
          view: this.args.controller.mainEditorView,
        },
      );
    }
  }

  @action
  toggleCard() {
    this.cardExpanded = !this.cardExpanded;
  }
}
