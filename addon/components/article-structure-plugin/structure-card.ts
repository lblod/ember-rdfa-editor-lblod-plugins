import Component from '@glimmer/component';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor';
import { moveStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands/move-structure';
import { ArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { findAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/find-ancestor-of-type';
import recalculateStructureNumbers from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands/recalculate_structure_number';

type Args = {
  controller: ProseController;
  widgetArgs: {
    options: ArticleStructurePluginOptions;
  };
};

export default class EditorPluginsStructureCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  @action
  moveStructure(_moveUp: boolean) {
    this.controller.doCommand(moveStructure);
  }

  @action
  removeStructure() {
    if (this.structure) {
      const { pos, node } = this.structure;
      this.controller.withTransaction((tr) => {
        tr.replace(pos, pos + node.nodeSize);
        return recalculateStructureNumbers(tr, ...this.structureTypes);
      });
    }
  }

  get structureTypes() {
    return this.args.widgetArgs.options;
  }

  get structureNodeSpecs() {
    return this.structureTypes.map(
      (type) => this.controller.schema.nodes[type.name]
    );
  }

  get structure() {
    const currentSelection = this.controller.state.selection;
    return findAncestorOfType(currentSelection, ...this.structureNodeSpecs);
  }

  get isOutsideStructure() {
    return !this.structure;
  }

  get canMoveDown() {
    return this.controller.checkCommand(moveStructure);
  }

  get canMoveUp() {
    return this.controller.checkCommand(moveStructure);
  }
}
