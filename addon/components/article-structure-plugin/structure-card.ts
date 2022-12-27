import Component from '@glimmer/component';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor';
import { trackedFunction } from 'ember-resources/util/function';
import {
  deleteStructure,
  moveStructure,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands';
import { ResolvedArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import validateDatastore from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/validate-datastore';
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
    if (structureToMove && this.structure) {
      const shaclReport = await validateDatastore(
        this.controller.datastore,
        structureToMove.shaclConstraint
      );
      this.controller.doCommand(
        moveStructure(
          this.controller,
          this.structure.uri,
          moveUp,
          this.args.widgetArgs.options,
          shaclReport
        )
      );
    }
  }

  @action
  removeStructure() {
    if (this.structure) {
      this.controller.doCommand(
        deleteStructure(
          this.controller,
          this.structure.uri,
          this.args.widgetArgs.options
        )
      );
    }
  }

  get structure(): { uri: string; type: string } | undefined {
    const currentSelection = this.controller.state.selection;
    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      currentSelection.from,
      currentSelection.to
    );

    const quad = limitedDatastore
      .match(null, 'a')
      .transformDataset((dataset) => {
        return dataset.filter((quad) => {
          return this.args.widgetArgs.options.structureTypes.includes(
            quad.object.value
          );
        });
      })
      .asQuadResultSet()
      .first();
    if (quad) {
      return { uri: quad.subject.value, type: quad.object.value };
    }
    return;
  }

  get structureTypeSelected() {
    const structureTypeof = this.structure?.type;
    if (structureTypeof) {
      return this.args.widgetArgs.options.structures.find((structure) =>
        structureTypeof.includes(structure.type)
      );
    }
    return;
  }

  get isOutsideStructure() {
    return !this.structure?.uri;
  }

  canMoveDown = trackedFunction(this, async () => {
    const structureToMove = this.args.widgetArgs.options.structures.find(
      (structure) => structure === this.structureTypeSelected
    );
    if (structureToMove && this.structure) {
      const shaclReport = await validateDatastore(
        this.controller.datastore,
        structureToMove.shaclConstraint
      );
      return this.controller.checkCommand(
        moveStructure(
          this.controller,
          this.structure.uri,
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
    if (structureToMove && this.structure) {
      const shaclReport = await validateDatastore(
        this.controller.datastore,
        structureToMove.shaclConstraint
      );
      return this.controller.checkCommand(
        moveStructure(
          this.controller,
          this.structure.uri,
          true,
          this.args.widgetArgs.options,
          shaclReport
        )
      );
    }
    return false;
  });
}
