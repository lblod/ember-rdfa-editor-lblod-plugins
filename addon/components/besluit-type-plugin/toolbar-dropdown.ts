import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { getOwner } from '@ember/application';
import fetchBesluitTypes, { BesluitType } from '../../utils/fetchBesluitTypes';
import { inject as service } from '@ember/service';
import {
  addType,
  removeType,
} from '@lblod/ember-rdfa-editor/commands/type-commands';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import CurrentSessionService from '@lblod/frontend-gelinkt-notuleren/services/current-session';
declare module 'ember__owner' {
  export default interface Owner {
    resolveRegistration(name: string): unknown;
  }
}

type Args = {
  controller: ProseController;
};

export default class EditorPluginsToolbarDropdownComponent extends Component<Args> {
  @service declare currentSession: CurrentSessionService;

  /**
   * Actual besluit type selected
   * @property besluitType
   * @type BesluitType
   * @private
   */
  @tracked besluitType?: BesluitType;
  @tracked previousBesluitType?: string;
  @tracked types: BesluitType[] = [];

  //used to update selections since the other vars dont seem to work in octane
  @tracked besluit?: BesluitType;
  @tracked subBesluit?: BesluitType;
  @tracked subSubBesluit?: BesluitType;

  @tracked cardExpanded = false;
  @tracked loadDataTaskInstance;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    this.loadDataTaskInstance = this.loadData.perform();
  }

  get controller() {
    return this.args.controller;
  }

  loadData = task(async () => {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const bestuurseenheid = await this.currentSession.get('group');
    const classificatie = await bestuurseenheid.get('classificatie');
    const ENV = getOwner(this)?.resolveRegistration('config:environment') as {
      besluitTypePlugin: { endpoint: string };
    };
    const types = await fetchBesluitTypes(classificatie.uri, ENV);
    this.types = types;
  });

  get currentBesluitNode() {
    const selection = this.controller.state.selection;
    const currentBesluitNode = [
      ...this.controller.datastore
        .limitToRange(this.controller.state, selection.from, selection.to)
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
        .asSubjectNodeMapping(),
    ][0]?.nodes[0];
    if (!currentBesluitNode) {
      return;
    }
    if (!currentBesluitNode?.pos) {
      throw new Error('Besluit node should have a position');
    }
    return { pos: currentBesluitNode.pos.pos, node: currentBesluitNode.node };
  }

  get showCard() {
    return !!this.currentBesluitNode;
  }

  @action
  updateBesluitTypes() {
    const currentBesluitNode = this.currentBesluitNode;
    if (!currentBesluitNode) {
      return;
    }
    const besluitTypes = this.controller.datastore
      .match(
        `>${currentBesluitNode.node.attrs['resource'] as string}`,
        'a',
        undefined
      )
      .asQuads();
    const besluitTypesUris = [...besluitTypes].map((quad) => quad.object.value);
    const besluitTypeRelevant = besluitTypesUris.find((type) =>
      type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')
    );
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
    array: BesluitType[] = this.types,
    parent?: BesluitType
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
    types = this.types
  ): BesluitType | undefined {
    if (uri) {
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
    if (this.besluitType && this.currentBesluitNode) {
      this.cardExpanded = false;
      this.controller.checkAndDoCommand(
        addType(this.currentBesluitNode.pos, this.besluitType.uri)
      );
      if (this.previousBesluitType) {
        this.controller.checkAndDoCommand(
          removeType(this.currentBesluitNode.pos, this.previousBesluitType)
        );
      }
    }
  }

  @action
  toggleCard() {
    this.cardExpanded = !this.cardExpanded;
  }
}
