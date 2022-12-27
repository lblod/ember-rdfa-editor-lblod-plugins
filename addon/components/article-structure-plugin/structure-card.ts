import Component from '@glimmer/component';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor';
import {
  moveSelectedStructure,
  recalculateStructureNumbers,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands';
import { ArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { findAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils';

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
  moveStructure(direction: 'up' | 'down') {
    this.controller.doCommand(
      moveSelectedStructure(this.structureTypes, direction)
    );
    this.controller.focus();
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

  get currentStructureType() {
    if (this.structure) {
      const { node: structureNode } = this.structure;
      return this.structureTypes.find(
        (spec) => spec.name === structureNode.type.name
      );
    }
    return;
  }

  get isOutsideStructure() {
    return !this.structure;
  }

  get canMoveDown() {
    return this.controller.checkCommand(
      moveSelectedStructure(this.structureTypes, 'down')
    );
  }

  get canMoveUp() {
    return this.controller.checkCommand(
      moveSelectedStructure(this.structureTypes, 'up')
    );
  }
}
