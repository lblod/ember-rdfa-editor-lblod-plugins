import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { SayController } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
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
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

type Args = {
  controller: SayController;
  options: BesluitTopicPluginOptions;
};

const ELI_SUBJECT = 'is_about';

export default class BesluitTopicToolbarDropdownComponent extends Component<Args> {
  MailIcon = MailIcon;
  CrossIcon = CrossIcon;
  AlertTriangleIcon = AlertTriangleIcon;

  /**
   * Actual besluit topic selected
   */
  @tracked besluitTopic?: BesluitTopic;
  @tracked previousBesluitTopic?: string;

  /**
   * used to update selections since the other vars don't seem to work in octane
   */
  @tracked besluit?: BesluitTopic;

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

  findBesluitTopicByURI(
    uri: string,
    topics = this.topics.value,
  ): BesluitTopic | undefined {
    if (!uri || !topics) return;

    return topics.find((besluitTopic) => besluitTopic.uri === uri);
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

    const besluitTopics = getOutgoingTripleList(
      besluit.node.attrs,
      ELI(ELI_SUBJECT),
    );

    const besluitTopicRelevant = besluitTopics.find(
      (topic) =>
        topic.object.termType === 'NamedNode' &&
        topic.object.value.includes(
          'https://data.vlaanderen.be/id/concept/BesluitThema/',
        ),
    )?.object.value;

    if (besluitTopicRelevant) {
      this.previousBesluitTopic = besluitTopicRelevant;
      this.besluit = this.findBesluitTopicByURI(besluitTopicRelevant);
      this.cardExpanded = false;
    } else {
      this.cardExpanded = true;
      this.besluit = undefined;
    }
  }

  get showCard() {
    return !!getCurrentBesluitRange(this.controller);
  }

  @action
  upsertBesluitTopic(selected: BesluitTopic) {
    this.besluit = selected;
    this.besluitTopic = selected;

    this.insert();
  }

  insert() {
    const currentBesluitRange = getCurrentBesluitRange(this.controller);

    const resource =
      (currentBesluitRange &&
        'node' in currentBesluitRange &&
        (currentBesluitRange.node.attrs.subject as string)) ||
      undefined;

    if (this.besluitTopic && resource) {
      this.cardExpanded = false;

      if (this.previousBesluitTopic) {
        this.controller.doCommand(
          removeProperty({
            resource,
            property: {
              predicate: ELI(ELI_SUBJECT).prefixed,
              object: sayDataFactory.namedNode(this.previousBesluitTopic),
            },
          }),
          { view: this.controller.mainEditorView },
        );
      }

      this.controller.doCommand(
        addProperty({
          resource,
          property: {
            predicate: ELI(ELI_SUBJECT).prefixed,
            object: sayDataFactory.namedNode(this.besluitTopic.uri),
          },
        }),
        { view: this.controller.mainEditorView },
      );
    }
  }

  @action
  toggleCard() {
    this.cardExpanded = !this.cardExpanded;
  }
}
