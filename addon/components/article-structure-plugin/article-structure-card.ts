import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { ProseController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import {
  ArticleStructurePluginOptions,
  StructureSpec,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { action } from '@ember/object';
import { insertStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands';

type Args = {
  controller: ProseController;
  widgetArgs: {
    options: ArticleStructurePluginOptions;
  };
};
export default class EditorPluginsArticleStructureCardComponent extends Component<Args> {
  @service declare intl: IntlService;

  get structureTypes() {
    return this.args.widgetArgs.options;
  }

  @action
  insertStructure(spec: StructureSpec) {
    this.args.controller.doCommand(insertStructure(spec, this.intl));
    this.args.controller.focus();
  }

  canInsertStructure = (spec: StructureSpec) =>
    this.args.controller.checkCommand(insertStructure(spec, this.intl));
}
