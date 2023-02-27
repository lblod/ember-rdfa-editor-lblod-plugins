import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
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
  controller: SayController;
  options: ArticleStructurePluginOptions;
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
      moveSelectedStructure(this.structureTypes, direction, this.intl),
      { view: this.controller.mainEditorView }
    );
    this.controller.focus();
  }

  @action
  removeStructure() {
    if (this.structure && this.currentStructureType) {
      if (this.removeStructureContent || this.currentStructureType.noUnwrap) {
        this.controller.doCommand(
          removeStructure(this.structure, this.structureTypes),
          { view: this.controller.mainEditorView }
        );
      } else {
        this.controller.doCommand(
          unwrapStructure(
            {
              ...this.structure,
              type: this.currentStructureType,
            },
            this.structureTypes
          ),
          { view: this.controller.mainEditorView }
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
    return this.args.options;
  }

  get structureNodeSpecs() {
    return this.structureTypes.map(
      (type) => this.controller.schema.nodes[type.name]
    );
  }

  get structure() {
    const currentSelection = this.controller.mainEditorState.selection;
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
      moveSelectedStructure(this.structureTypes, 'down', this.intl),
      { view: this.controller.mainEditorView }
    );
  }

  get canMoveUp() {
    return this.controller.checkCommand(
      moveSelectedStructure(this.structureTypes, 'up', this.intl),
      { view: this.controller.mainEditorView }
    );
  }

  get canRemoveStructure() {
    if (this.structure && this.currentStructureType) {
      if (this.removeStructureContent || this.currentStructureType.noUnwrap) {
        return true;
      } else {
        return this.controller.checkCommand(
          unwrapStructure(
            {
              ...this.structure,
              type: this.currentStructureType,
            },
            this.structureTypes
          ),
          { view: this.controller.mainEditorView }
        );
      }
    }
    return false;
  }
}
