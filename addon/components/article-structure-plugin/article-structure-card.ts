import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import {
  ArticleStructurePluginOptions,
  StructureSpec,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { action } from '@ember/object';
import { insertStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands';
import { SayController } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: SayController;
  options: ArticleStructurePluginOptions;
};
export default class EditorPluginsArticleStructureCardComponent extends Component<Args> {
  @service declare intl: IntlService;

  get structureTypes() {
    return this.args.options;
  }

  get controller() {
    return this.args.controller;
  }

  @action
  insertStructure(spec: StructureSpec) {
    this.args.controller.doCommand(insertStructure(spec, this.intl), {
      view: this.controller.mainEditorView,
    });
    this.args.controller.focus();
  }

  canInsertStructure = (spec: StructureSpec) =>
    this.args.controller.checkCommand(insertStructure(spec, this.intl), {
      view: this.controller.mainEditorView,
    });
}
