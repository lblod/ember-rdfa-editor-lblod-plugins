import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  insertTitle,
  insertArticle,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-plugin/commands';
import { ProseController } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: ProseController;
};

export default class BesluitPluginCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  focus() {
    this.controller.focus();
  }
  @action
  insertArticle() {
    this.controller.checkAndDoCommand(insertArticle(this.controller, ''));
    this.focus();
  }

  @action
  insertTitle() {
    this.controller.doCommand(insertTitle(this.controller, ''));
    this.focus();
  }

  get hasTitle() {
    return !this.controller.checkCommand(insertTitle(this.controller, ''));
  }

  get disableArticleInsert() {
    return !this.controller.checkCommand(insertArticle(this.controller, ''));
  }
}
