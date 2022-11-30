import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditorPluginsStructureCardComponent extends Component {
  @tracked isOutsideStructure = true;
  @tracked structureUri = undefined;
  @tracked canMoveUp = false;
  @tracked canMoveDown = false;
  @tracked structureTypeSelected;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'selectionChanged',
      this.selectionChangedHandler
    );
  }

  @action
  moveStructure(moveUp) {
    this.args.controller.executeCommand(
      'move-structure-v2',
      this.args.controller,
      this.structureUri,
      moveUp,
      this.args.widgetArgs.options
    );
  }

  @action
  removeStructure() {
    this.args.controller.executeCommand(
      'delete-node-from-uri',
      this.args.controller,
      this.structureUri,
      'structure',
      this.args.widgetArgs.options
    );
  }

  @action
  async selectionChangedHandler() {
    const currentSelection = this.args.controller.selection.lastRange;
    if (!currentSelection) {
      return;
    }
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      currentSelection,
      'rangeIsInside'
    );

    const documentMatches = limitedDatastore
      .match(null, 'a', null)
      .transformDataset((dataset) => {
        return dataset.filter((quad) => {
          return this.args.widgetArgs.options.structureTypes.includes(
            quad.object.value
          );
        });
      })
      .asPredicateNodeMapping()
      .single();
    if (
      documentMatches &&
      documentMatches.nodes &&
      documentMatches.nodes.length
    ) {
      const structure = documentMatches.nodes.pop();
      const structureUri = structure.getAttribute('resource');
      const headingMatch = limitedDatastore
        .match(`>${structureUri}`, '>https://say.data.gift/ns/heading', null)
        .asPredicateNodeMapping()
        .single();
      if (headingMatch && headingMatch.nodes && headingMatch.nodes.length) {
        this.isOutsideStructure = false;
        this.structureUri = structureUri;
        const structureTypeof = structure.getAttribute('typeof');
        this.structureTypeSelected =
          this.args.widgetArgs.options.structures.find((structure) =>
            structureTypeof.includes(structure.type)
          );
        this.canMoveUp = await this.args.controller.canExecuteCommand(
          'move-structure-v2',
          this.args.controller,
          this.structureUri,
          true,
          this.args.widgetArgs.options
        );
        this.canMoveDown = await this.args.controller.canExecuteCommand(
          'move-structure-v2',
          this.args.controller,
          this.structureUri,
          false,
          this.args.widgetArgs.options
        );
      } else {
        this.isOutsideStructure = true;
        this.structureUri = undefined;
      }
    }
  }
}
