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
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { restartableTask, timeout } from 'ember-concurrency';

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
      moveSelectedStructure({
        specs: this.structureTypes,
        direction,
        intl: this.intl,
        upperSearchLimit: this.upperSearchLimit,
      })
    );
    this.controller.focus();
  }

  @action
  removeStructure() {
    if (this.structure && this.currentStructureType) {
      if (this.removeStructureContent) {
        this.controller.doCommand(
          removeStructure({
            structure: this.structure,
            specs: this.structureTypes,
          })
        );
      } else {
        this.controller.doCommand(
          unwrapStructure({
            structure: {
              ...this.structure,
              type: this.currentStructureType,
            },
            specs: this.structureTypes,
          })
        );
      }
    }
    this.controller.focus();
  }

  @action
  setRemoveStructureContent(value: boolean) {
    this.removeStructureContent = value;
  }

  get options() {
    return this.args.widgetArgs.options;
  }

  get structureTypes() {
    return this.options.specs;
  }

  get upperSearchLimit() {
    return this.options.search_limit;
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

  canMoveDownTask = restartableTask(async () => {
    const { debounce_ms } = this.options;
    if (debounce_ms) {
      await timeout(debounce_ms);
    }
    return this.controller.checkCommand(
      moveSelectedStructure({
        specs: this.structureTypes,
        direction: 'down',
        intl: this.intl,
        upperSearchLimit: this.upperSearchLimit,
      })
    );
  });

  canMoveDown = trackedTask(this, this.canMoveDownTask, () => [
    this.controller.state,
  ]);

  canMoveUpTask = restartableTask(async () => {
    const { debounce_ms } = this.options;
    if (debounce_ms) {
      await timeout(debounce_ms);
    }
    return this.controller.checkCommand(
      moveSelectedStructure({
        specs: this.structureTypes,
        direction: 'up',
        intl: this.intl,
        upperSearchLimit: this.upperSearchLimit,
      })
    );
  });

  canMoveUp = trackedTask(this, this.canMoveUpTask, () => [
    this.controller.state,
  ]);

  get canRemoveStructure() {
    if (this.structure && this.currentStructureType) {
      if (this.removeStructureContent) {
        return true;
      } else {
        return this.controller.checkCommand(
          unwrapStructure({
            structure: {
              ...this.structure,
              type: this.currentStructureType,
            },
            specs: this.structureTypes,
          })
        );
      }
    }
    return false;
  }
}
