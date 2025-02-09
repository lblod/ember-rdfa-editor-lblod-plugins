import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { RDF } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import { RoadsignRegulationPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';

/**
 * Card displaying a hint of the Date plugin
 *
 * @module editor-roadsign-regulation-plugin
 * @class RoadsignRegulationCard
 * @extends Ember.Component
 */
const acceptedTypes = [
  'https://data.vlaanderen.be/id/concept/BesluitType/4d8f678a-6fa4-4d5f-a2a1-80974e43bf34',
  'https://data.vlaanderen.be/id/concept/BesluitType/7d95fd2e-3cc9-4a4c-a58e-0fbc408c2f9b',
  'https://data.vlaanderen.be/id/concept/BesluitType/3bba9f10-faff-49a6-acaa-85af7f2199a3',
  'https://data.vlaanderen.be/id/concept/BesluitType/0d1278af-b69e-4152-a418-ec5cfd1c7d0b',
  'https://data.vlaanderen.be/id/concept/BesluitType/e8afe7c5-9640-4db8-8f74-3f023bec3241',
  'https://data.vlaanderen.be/id/concept/BesluitType/256bd04a-b74b-4f2a-8f5d-14dda4765af9',
  'https://data.vlaanderen.be/id/concept/BesluitType/67378dd0-5413-474b-8996-d992ef81637a',
];

type Args = {
  controller: SayController;
  options: RoadsignRegulationPluginOptions;
};

export default class RoadsignRegulationCard extends Component<Args> {
  AddIcon = AddIcon;

  @tracked modalOpen = false;

  @action
  openModal() {
    this.controller.focus();
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get showCard() {
    const decisionContext = this.args.options.decisionContext;
    let decisionTypes = [];
    if (decisionContext && decisionContext.decisionType) {
      decisionTypes = [decisionContext.decisionType];
    } else {
      const decisionRange = getCurrentBesluitRange(this.controller);
      if (!decisionRange) {
        return false;
      }
      const decisionNode = decisionRange.node;
      const properties: OutgoingTriple[] = decisionNode.attrs.properties;
      decisionTypes = properties
        .filter(
          ({ predicate, object }) =>
            RDF('type').matches(predicate) && object.termType === 'NamedNode',
        )
        .map((property) => property.object.value);
    }

    const decisionHasAcceptedType = decisionTypes.some((type) =>
      acceptedTypes.includes(type),
    );
    return decisionHasAcceptedType;
  }
}
