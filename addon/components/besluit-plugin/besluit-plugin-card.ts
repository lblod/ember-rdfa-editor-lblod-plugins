import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  insertTitle,
  insertArticle,
} from '@lblod/ember-rdfa-editor-lblod-plugins/commands/besluit-plugin';
import { ProseController } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: ProseController;
};

export default class BesluitPluginCardComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  @action
  insertArticle() {
    this.controller.checkAndDoCommand(insertArticle(this.controller, '', ''));
  }

  @action
  insertTitle() {
    this.controller.doCommand(insertTitle(this.controller, ''));
  }

  get hasTitle() {
    return !this.controller.checkCommand(insertTitle(this.controller, ''));
  }

  get disableArticleInsert() {
    return !this.controller.checkCommand(
      insertArticle(this.controller, '', '')
    );
  }
}
