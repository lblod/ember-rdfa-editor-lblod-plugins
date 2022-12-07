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
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { Node } from 'prosemirror-model';
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
  @tracked showCard = false;

  @tracked loadDataTaskInstance;

  @tracked besluitPos?: number;
  @tracked besluitNode?: Node;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    this.loadDataTaskInstance = this.loadData.perform();
  }

  get controller() {
    return this.args.controller;
  }

  // @task
  // *loadData() {
  //   const bestuurseenheid: unknown = yield this.currentSession.get('group');
  //   const classificatie = yield bestuurseenheid.get('classificatie');
  //   const ENV = getOwner(this).resolveRegistration('config:environment');
  //   const types = yield fetchBesluitTypes(classificatie.uri, ENV);
  //   this.types = types;
  // }

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

  @action
  getBesluitType() {
    const selection = this.controller.state.selection;
    console.log('DOC: ', this.controller.state.doc);
    if (!selection.from) {
      return;
    }
    let besluitUri: string | undefined;
    let besluitPos;
    let besluitNode;
    // TODO: implement finding besluit node and position using datastore
    this.controller.state.doc.descendants((node, pos) => {
      if (besluitUri) {
        return false;
      }
      if ((node.attrs['typeof'] as string)?.includes('besluit:Besluit')) {
        console.log(node.attrs);
        besluitPos = pos;
        besluitNode = node;
        besluitUri = node.attrs['resource'] as string;
        return false;
      }
    });
    if (!besluitUri) {
      this.showCard = false;
      return;
    }
    this.besluitPos = besluitPos;
    this.besluitNode = besluitNode;
    this.showCard = true;
    const besluitTypes = this.controller.datastore
      .match(`>${besluitUri}`, 'a', undefined)
      .asQuads();
    const besluitTypesUris = [...besluitTypes].map((quad) => quad.object.value);
    console.log('URIS: ', besluitTypesUris);
    const besluitTypeRelevant = besluitTypesUris.find((type) =>
      type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')
    );
    console.log('BESLUIT TYPE RELEVANT: ', besluitTypeRelevant);
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
    if (
      this.besluitType &&
      this.besluitPos !== undefined &&
      this.besluitPos !== null
    ) {
      this.cardExpanded = false;
      if (this.previousBesluitType) {
        this.controller.checkAndDoCommand(
          removeType(this.besluitPos, this.previousBesluitType)
        );
      }
      this.controller.checkAndDoCommand(
        addType(this.besluitPos, this.besluitType.uri)
      );
    }
  }

  @action
  toggleCard() {
    this.cardExpanded = !this.cardExpanded;
  }
}
