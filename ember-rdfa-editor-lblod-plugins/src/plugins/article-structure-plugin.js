import DeleteNodeFromUriCommand from '../commands/delete-node-from-uri-command';
import InsertArticleStructureV2Command from '../commands/insert-article-structure-v2';
import MoveStructureCommandV2 from '../commands/move-structure-command-v2';
import RecalculateStructureNumbersCommandV2 from '../commands/recalculate-structure-numbers-command-v2';
import { STRUCTURES } from '../utils/article-structure-plugin/constants';

/**
 * Entry point for ArticleStructurePlugin
 *
 * @module ember-rdfa-editor-article-structure-plugin
 * @class ArticleStructurePlugin
 * @constructor
 * @extends EmberService
 */
export default class ArticleStructurePlugin {
  /**
   * Handles the incoming events from the editor dispatcher.  Responsible for generating hint cards.
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the state in the HintsRegistry.  Allows the
   * HintsRegistry to update absolute selected regions based on what a user has entered in between.
   * @param {Array} rdfaBlocks Set of logical blobs of content which may have changed.  Each blob is
   * either has a different semantic meaning, or is logically separated (eg: a separate list item).
   * @param {Object} hintsRegistry Keeps track of where hints are positioned in the editor.
   * @param {Object} editor Your public interface through which you can alter the document.
   *
   * @public
   */
  controller;

  get name() {
    return 'article-structure';
  }

  initialize(controller, options) {
    this.controller = controller;
    controller.registerCommand(
      new DeleteNodeFromUriCommand(controller._rawEditor._model)
    );
    controller.registerCommand(
      new InsertArticleStructureV2Command(controller._rawEditor._model)
    );
    controller.registerCommand(
      new RecalculateStructureNumbersCommandV2(controller._rawEditor._model)
    );
    controller.registerCommand(
      new MoveStructureCommandV2(controller._rawEditor._model)
    );
    const structuresSelected = [];
    const structuresTypesSelectedByUser =
      (options && options.structures) || Object.keys(STRUCTURES);
    for (let type of structuresTypesSelectedByUser) {
      if (typeof type === 'string') {
        const defaultStructure = STRUCTURES[type];
        if (defaultStructure) {
          structuresSelected.push(defaultStructure);
        } else {
          console.warn(
            `Article Structure Plugin: structure type ${type} not found in the default structure types`
          );
        }
      } else {
        structuresSelected.push(type);
      }
    }
    const optionsWithDefaults = {
      structures: structuresSelected,
      structureTypes: structuresSelected.map((structure) => structure.type),
    };
    controller.registerWidget({
      componentName: 'article-structure-plugin/article-structure-card',
      identifier: 'article-structure-plugin/card',
      desiredLocation: 'insertSidebar',
      widgetArgs: {
        options: optionsWithDefaults,
      },
    });
    controller.registerWidget({
      componentName: 'article-structure-plugin/structure-card',
      identifier: 'article-structure-plugin/structure-card',
      desiredLocation: 'sidebar',
      widgetArgs: {
        options: optionsWithDefaults,
      },
    });
    this.options = optionsWithDefaults;
  }
}
