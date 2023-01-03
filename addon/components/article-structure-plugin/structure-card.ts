import Component from '@glimmer/component';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor';
import {
  moveSelectedStructure,
  removeStructure,
  unwrapStructure,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands';
import { ArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { findAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller: ProseController;
  widgetArgs: {
    options: ArticleStructurePluginOptions;
  };
};

export default class EditorPluginsStructureCardComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked removeStructureContent = false;

  get controller() {
    return this.args.controller;
  }

  @action
  moveStructure(direction: 'up' | 'down') {
    this.controller.doCommand(
      moveSelectedStructure(this.structureTypes, direction, this.intl)
    );
    this.controller.focus();
  }

  @action
  removeStructure() {
    if (this.structure && this.currentStructureType) {
      if (this.removeStructureContent) {
        this.controller.doCommand(
          removeStructure(this.structure, this.structureTypes)
        );
      } else {
        this.controller.doCommand(
          unwrapStructure(
            {
              ...this.structure,
              type: this.currentStructureType,
            },
            this.structureTypes
          )
        );
      }
    }
    this.controller.focus();
  }

  @action
  setRemoveStructureContent(value: boolean) {
    this.removeStructureContent = value;
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
      moveSelectedStructure(this.structureTypes, 'down', this.intl)
    );
  }

  get canMoveUp() {
    return this.controller.checkCommand(
      moveSelectedStructure(this.structureTypes, 'up', this.intl)
    );
  }

  get canRemoveStructure() {
    if (this.structure && this.currentStructureType) {
      if (this.removeStructureContent) {
        return true;
      } else {
        return this.controller.checkCommand(
          unwrapStructure(
            {
              ...this.structure,
              type: this.currentStructureType,
            },
            this.structureTypes
          )
        );
      }
    }
    return false;
  }
}
