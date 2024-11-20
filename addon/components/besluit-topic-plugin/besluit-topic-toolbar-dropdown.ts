import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { setExternalTriples } from '@lblod/ember-rdfa-editor/utils/external-triple-utils';
import { trackedFunction } from 'reactiveweb/function';
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
import {
  FullTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

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
    return this.decisionUri || this.decisionRange;
  }
  get options() {
    return this.args.options;
  }
  get decisionUri() {
    return this.options.decisionUri;
  }

  get currentTopicUris() {
    if (this.decisionRange) {
      const triples: OutgoingTriple[] = getOutgoingTripleList(
        this.decisionRange.node.attrs,
        ELI(ELI_SUBJECT),
      );
      const topicTriples = triples.filter(
        (topic) =>
          topic.object.termType === 'NamedNode' &&
          topic.object.value.includes(
            'https://data.vlaanderen.be/id/concept/BesluitThema/',
          ),
      );
      return topicTriples.map((topic) => topic.object.value);
    } else if (this.decisionUri) {
      const triples: FullTriple[] = this.doc.attrs['externalTriples'];
      const topicTriples = triples.filter(
        (topic) =>
          topic.subject.value === this.decisionUri &&
          topic.object.termType === 'NamedNode' &&
          topic.object.value.includes(
            'https://data.vlaanderen.be/id/concept/BesluitThema/',
          ),
      );
      return topicTriples.map((topic) => topic.object.value);
    } else {
      return [];
    }
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
    if (!this.topics.isFinished || !this.showCard) {
      return;
    }
    if (!this.topics.value) {
      console.warn('Request for besluit topics failed');
      return;
    }

    const besluitTopics = this.findBesluitTopicsByUris(this.currentTopicUris);

    if (this.currentTopicUris && besluitTopics) {
      this.previousBesluitTopics = this.currentTopicUris;

      this.besluitTopicsSelected = besluitTopics;
    } else {
      this.besluitTopicsSelected = undefined;
    }
  }

  @action
  upsertBesluitTopic(selected: BesluitTopic[]) {
    this.besluitTopicsSelected = selected;

    if (this.besluitTopicsSelected) {
      const resource = getCurrentBesluitURI(this.controller);
      if (resource) {
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
      } else if (this.decisionUri) {
        const factory = new SayDataFactory();
        // locking it in for the closure
        const decisionUri = this.decisionUri;
        const newTriples = this.besluitTopicsSelected.map((topic) => ({
          subject: factory.namedNode(decisionUri),
          predicate: ELI(ELI_SUBJECT).full,
          object: factory.namedNode(topic.uri),
        }));
        const res = setExternalTriples(newTriples)(
          this.controller.mainEditorState,
        );
        if (res.result) {
          this.controller.mainEditorView.dispatch(res.transaction);
        }
      }
    }
  }

  @action
  toggleCard() {
    this.cardExpanded = !this.cardExpanded;
  }
}
