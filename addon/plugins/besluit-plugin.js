import InsertArticleCommand from '../commands/insert-article-command';
import InsertTitleCommand from '../commands/insert-title-command';
import MoveArticleCommand from '../commands/move-article-command';
import RecalculateArticleNumbersCommand from '../commands/recalculate-article-numbers-command';

export default class BesluitPlugin {
  controller;

  get name() {
    return 'besluit';
  }

  initialize(controller) {
    this.controller = controller;
    controller.registerCommand(
      new InsertArticleCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new InsertTitleCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new MoveArticleCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new RecalculateArticleNumbersCommand(controller._rawEditor._model)
    );
    controller.registerWidget({
      componentName: 'besluit-plugin-card',
      identifier: 'besluit-plugin/card',
      desiredLocation: 'insertSidebar',
    });
    controller.registerWidget({
      componentName: 'besluit-context-card',
      identifier: 'besluit-context-plugin/card',
      desiredLocation: 'sidebar',
    });
  }
}
