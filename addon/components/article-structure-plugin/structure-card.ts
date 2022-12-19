import Component from '@glimmer/component';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { trackedFunction } from 'ember-resources/util/function';
import {
  deleteStructure,
  moveStructure,
} from '@lblod/ember-rdfa-editor-lblod-plugins/commands/article-structure-plugin';
import validateDatastore from '@lblod/ember-rdfa-editor-lblod-plugins/utils/article-structure-plugin/validate-datastore';
import { ResolvedArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
type Args = {
  controller: ProseController;
  widgetArgs: {
    options: ResolvedArticleStructurePluginOptions;
  };
};

export default class EditorPluginsStructureCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  @action
  async moveStructure(moveUp: boolean) {
    const structureToMove = this.args.widgetArgs.options.structures.find(
      (structure) => structure === this.structureTypeSelected
    );
    if (structureToMove && this.structureUri) {
      const shaclReport = await validateDatastore(
        this.controller.datastore,
        structureToMove.shaclConstraint
      );
      this.controller.doCommand(
        moveStructure(
          this.controller,
          this.structureUri,
          moveUp,
          this.args.widgetArgs.options,
          shaclReport
        )
      );
    }
  }

  @action
  removeStructure() {
    if (this.structureUri) {
      this.controller.doCommand(
        deleteStructure(
          this.controller,
          this.structureUri,
          this.args.widgetArgs.options
        )
      );
    }
  }

  get structure() {
    const currentSelection = this.controller.state.selection;
    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      currentSelection.from,
      currentSelection.to
    );

    const documentMatches = limitedDatastore
      .match(null, 'a')
      .transformDataset((dataset) => {
        return dataset.filter((quad) => {
          return this.args.widgetArgs.options.structureTypes.includes(
            quad.object.value
          );
        });
      })
      .asPredicateNodeMapping()
      .single();
    if (
      documentMatches &&
      documentMatches.nodes &&
      documentMatches.nodes.length
    ) {
      const structure = unwrap(documentMatches.nodes.pop()).node;
      const structureUri = structure.attrs['resource'] as string;
      const headingMatch = limitedDatastore
        .match(`>${structureUri}`, '>https://say.data.gift/ns/heading')
        .asPredicateNodeMapping()
        .single();
      if (headingMatch && headingMatch.nodes && headingMatch.nodes.length) {
        return structure;
      }
    }
    return;
  }

  get structureUri() {
    return this.structure?.attrs['resource'] as string | undefined;
  }

  get structureTypeSelected() {
    const structureTypeof = this.structure?.attrs['typeof'] as
      | string
      | undefined;
    if (structureTypeof) {
      return this.args.widgetArgs.options.structures.find((structure) =>
        structureTypeof.includes(structure.type)
      );
    }
    return;
  }

  get isOutsideStructure() {
    return !this.structureUri;
  }

  canMoveDown = trackedFunction(this, async () => {
    const structureToMove = this.args.widgetArgs.options.structures.find(
      (structure) => structure === this.structureTypeSelected
    );
    if (structureToMove && this.structureUri) {
      const shaclReport = await validateDatastore(
        this.controller.datastore,
        structureToMove.shaclConstraint
      );
      return this.controller.checkCommand(
        moveStructure(
          this.controller,
          this.structureUri,
          false,
          this.args.widgetArgs.options,
          shaclReport
        )
      );
    }
    return false;
  });

  canMoveUp = trackedFunction(this, async () => {
    const structureToMove = this.args.widgetArgs.options.structures.find(
      (structure) => structure === this.structureTypeSelected
    );
    if (structureToMove && this.structureUri) {
      const shaclReport = await validateDatastore(
        this.controller.datastore,
        structureToMove.shaclConstraint
      );
      return this.controller.checkCommand(
        moveStructure(
          this.controller,
          this.structureUri,
          true,
          this.args.widgetArgs.options,
          shaclReport
        )
      );
    }
    return false;
  });
}
