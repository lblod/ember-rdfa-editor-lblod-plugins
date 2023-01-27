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
    await timeout(250);
    return this.structureTypes.map((type) => {
      return this.args.controller.checkCommand(
        insertStructure(type, this.intl)
      );
    });
  });

  canInsertStructures = trackedTask(this, this.canInsertStructuresTask, () => [
    this.args.controller.state,
  ]);

  get structureTypes() {
    return this.args.widgetArgs.options;
  }

  @action
  insertStructure(spec: StructureSpec) {
    this.args.controller.doCommand(insertStructure(spec, this.intl));
    this.args.controller.focus();
  }

  @restartableTask
  *canInsertStructure(spec: StructureSpec) {
    yield timeout(500);
    return this.args.controller.checkCommand(insertStructure(spec, this.intl));
  }
}
