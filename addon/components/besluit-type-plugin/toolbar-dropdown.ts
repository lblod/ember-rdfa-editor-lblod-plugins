import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { SayController } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { getRdfaAttribute } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import fetchBesluitTypes, {
  BesluitType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin/utils/fetchBesluitTypes';
import { findAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';
import { trackedFunction } from 'ember-resources/util/function';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { BesluitTypePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import { RDF } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { getParsedRDFAAttributeList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

declare module 'ember__owner' {
  export default interface Owner {
    resolveRegistration(name: string): unknown;
  }
}

type Args = {
  controller: SayController;
  options: BesluitTypePluginOptions;
};

export default class EditorPluginsToolbarDropdownComponent extends Component<Args> {
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

  get currentBesluitRange(): ResolvedPNode | undefined {
    const selection = this.controller.mainEditorState.selection;
    const besluit = findAncestorOfType(
      selection,
      this.controller.schema.nodes['besluit'],
    );
    if (!besluit) {
      return undefined;
    }
    return {
      node: besluit.node,
      from: besluit.start - 1,
      to: besluit.start + besluit.node.nodeSize - 1,
    };
  }

  get currentBesluitURI() {
    if (this.currentBesluitRange) {
      const node = unwrap(this.doc.nodeAt(this.currentBesluitRange.from));
      return getRdfaAttribute(node, 'resource').pop();
    }
    return;
  }

  get showCard() {
    return !!this.currentBesluitRange;
  }

  @action
  updateBesluitTypes() {
    if (!this.currentBesluitURI || !this.types.value) {
      return;
    }
    const besluit = findAncestorOfType(
      this.controller.mainEditorState.selection,
      this.controller.schema.nodes['besluit'],
    );
    if (!besluit) {
      console.warn(
        `We have a besluit URI (${this.currentBesluitURI}), but can't find a besluit ancestor`,
      );
      return;
    }
    const besluitTypes = getParsedRDFAAttributeList(
      besluit.node.attrs,
      RDF('type'),
    );
    const besluitTypeRelevant = besluitTypes.find((type) =>
      type.object.includes(
        'https://data.vlaanderen.be/id/concept/BesluitType/',
      ),
    )?.object;

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
    const resource =
      (this.currentBesluitRange &&
        'node' in this.currentBesluitRange &&
        (this.currentBesluitRange.node.attrs.resource as string)) ||
      undefined;
    if (this.besluitType && resource) {
      this.cardExpanded = false;
      if (this.previousBesluitType) {
        this.controller.doCommand(
          removeProperty({
            resource,
            property: {
              type: 'attribute',
              predicate: RDF('type').prefixed,
              object: this.previousBesluitType,
            },
          }),
          { view: this.controller.mainEditorView },
        );
      }
      this.controller.doCommand(
        addProperty({
          resource,
          property: {
            type: 'attribute',
            predicate: RDF('type').prefixed,
            object: this.besluitType.uri,
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
