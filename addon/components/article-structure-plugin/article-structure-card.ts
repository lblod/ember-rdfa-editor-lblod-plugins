import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { ProseController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { timeout, restartableTask } from 'ember-concurrency';
import {
  ArticleStructurePluginOptions,
  StructureSpec,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { action } from '@ember/object';
import { insertStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
type Args = {
  controller: ProseController;
  widgetArgs: {
    options: ArticleStructurePluginOptions;
  };
};
export default class EditorPluginsArticleStructureCardComponent extends Component<Args> {
  @service declare intl: IntlService;

  canInsertStructuresTask = restartableTask(async () => {
    const { debounce_ms } = this.options;
    if (debounce_ms) {
      await timeout(debounce_ms);
    }
    return this.structureTypes.map((type) => {
      return this.args.controller.checkCommand(
        insertStructure({ structureSpec: type, intl: this.intl })
      );
    });
  });

  canInsertStructures = trackedTask(this, this.canInsertStructuresTask, () => [
    this.args.controller.state,
  ]);

  get options() {
    return this.args.widgetArgs.options;
  }

  get structureTypes() {
    return this.options.specs;
  }

  get upperSearchLimit() {
    return this.options.search_limit;
  }

  @action
  insertStructure(spec: StructureSpec) {
    this.args.controller.doCommand(
      insertStructure({
        structureSpec: spec,
        intl: this.intl,
        upperSearchLimit: this.upperSearchLimit,
      })
    );
    this.args.controller.focus();
  }
}
