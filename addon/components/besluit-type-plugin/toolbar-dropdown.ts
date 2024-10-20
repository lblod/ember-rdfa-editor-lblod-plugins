import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { SayController } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import fetchBesluitTypes, {
  BesluitType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/fetchBesluitTypes';
import { trackedFunction } from 'reactiveweb/function';
import { BesluitTypePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import { RDF } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';
import { MailIcon } from '@appuniversum/ember-appuniversum/components/icons/mail';
import { CircleXIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-x';
import {
  getCurrentBesluitRange,
  getCurrentBesluitURI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';

type Args = {
  controller: SayController;
  options: BesluitTypePluginOptions;
};

export default class EditorPluginsToolbarDropdownComponent extends Component<Args> {
  CircleIcon = CircleXIcon;
  MailIcon = MailIcon;
  CrossIcon = CrossIcon;
  AlertTriangleIcon = AlertTriangleIcon;
  /**
   * Actual besluit type selected
   * @property besluitType
   * @type BesluitType
   * @private
   */
  @tracked besluitType?: BesluitType;
  @tracked previousBesluitType?: string;

  //used to update selections since the other vars dont seem to work in octane
  @tracked besluit?: BesluitType;
  @tracked subBesluit?: BesluitType;
  @tracked subSubBesluit?: BesluitType;

  @tracked cardExpanded = false;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
  }

  get controller() {
    return this.args.controller;
  }

  get doc() {
    return this.controller.mainEditorState.doc;
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

  @action
  updateBesluitTypes() {
    if (!this.types.isFinished || !this.currentBesluitRange) {
      return;
    }
    if (!this.types.value) {
      console.warn('Request for besluit types failed');
      return;
    }
    const besluit = this.currentBesluitRange;
    const besluitTypes = getOutgoingTripleList(besluit.node.attrs, RDF('type'));
    const besluitTypeRelevant = besluitTypes.find(
      (type) =>
        type.object.termType === 'NamedNode' &&
        type.object.value.includes(
          'https://data.vlaanderen.be/id/concept/BesluitType/',
        ),
    )?.object.value;

    if (besluitTypeRelevant) {
      this.previousBesluitType = besluitTypeRelevant;
      const besluitType = this.findBesluitTypeByURI(besluitTypeRelevant);

      const firstAncestor = this.findBesluitTypeParent(besluitType);
      const secondAncestor = this.findBesluitTypeParent(firstAncestor);
      if (firstAncestor && secondAncestor) {
        this.besluit = secondAncestor;
        this.subBesluit = firstAncestor;
        this.subSubBesluit = besluitType;
      } else if (firstAncestor) {
        this.besluit = firstAncestor;
        this.subBesluit = besluitType;
        this.subSubBesluit = undefined;
      } else {
        this.besluit = besluitType;
        this.subBesluit = undefined;
        this.subSubBesluit = undefined;
      }
      this.cardExpanded = false;
    } else {
      this.cardExpanded = true;
      this.besluit = undefined;
      this.subBesluit = undefined;
      this.subSubBesluit = undefined;
    }
  }

  @action
  updateBesluitType(selected: BesluitType) {
    this.besluit = selected;
    this.besluitType = selected;
    this.subBesluit = undefined;
    this.subSubBesluit = undefined;
    if (!selected.subTypes || !selected.subTypes.length) this.insert();
  }

  @action
  updateBesluitSubType(selected: BesluitType) {
    this.subBesluit = selected;
    this.besluitType = selected;
    this.subSubBesluit = undefined;
    if (!selected.subTypes || !selected.subTypes.length) this.insert();
  }

  @action
  updateBesluitSubSubType(selected: BesluitType) {
    this.subSubBesluit = selected;
    this.besluitType = selected;
    if (!selected.subTypes || !selected.subTypes.length) this.insert();
  }

  findBesluitTypeParent(
    besluitType?: BesluitType,
    array: BesluitType[] | null = this.types.value,
    parent?: BesluitType,
  ): BesluitType | undefined {
    if (!besluitType || !array) {
      return;
    }
    for (const type of array) {
      if (type == besluitType) {
        return parent;
      } else if (type.subTypes?.length) {
        parent = type;
        return this.findBesluitTypeParent(besluitType, type.subTypes, parent);
      }
    }
    return;
  }

  findBesluitTypeByURI(
    uri: string,
    types = this.types.value,
  ): BesluitType | undefined {
    if (uri && types) {
      for (const besluitType of types) {
        if (besluitType.uri === uri) {
          return besluitType;
        } else if (besluitType.subTypes && besluitType.subTypes.length) {
          const subType = this.findBesluitTypeByURI(uri, besluitType.subTypes);
          if (subType) {
            return subType;
          }
        }
      }
    }
    return;
  }

  insert() {
    const resource = this.currentBesluitURI;
    if (this.besluitType && resource) {
      this.cardExpanded = false;
      if (this.previousBesluitType) {
        this.controller.doCommand(
          removeProperty({
            resource,
            property: {
              predicate: RDF('type').full,
              object: sayDataFactory.namedNode(this.previousBesluitType),
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
            object: sayDataFactory.namedNode(this.besluitType.uri),
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
