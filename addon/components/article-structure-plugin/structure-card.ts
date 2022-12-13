import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor/addon';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { trackedFunction } from 'ember-resources/util/function';
import { Structure } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/article-structure-plugin/constants';
import deleteNodeFromURI from '@lblod/ember-rdfa-editor-lblod-plugins/commands/delete-node-from-uri-command';

type Args = {
  controller: ProseController;
  widgetArgs: {
    options: {
      structures: Structure[];
      structureTypes: string[];
    };
  };
};

export default class EditorPluginsStructureCardComponent extends Component<Args> {
  // @tracked canMoveUp = false;
  // @tracked canMoveDown = false;

  // constructor() {
  //   super(...arguments);
  //   this.args.controller.onEvent(
  //     'selectionChanged',
  //     this.selectionChangedHandler
  //   );
  // }

  get controller() {
    return this.args.controller;
  }

  @action
  moveStructure(moveUp: boolean) {
    this.controller.executeCommand(
      'move-structure-v2',
      this.args.controller,
      this.structureUri,
      moveUp,
      this.args.widgetArgs.options
    );
  }

  @action
  removeStructure() {
    if (this.structureUri) {
      this.controller.doCommand(
        deleteNodeFromURI(
          this.controller,
          this.structureUri,
          'structure',
          this.args.widgetArgs.options
        )
      );
    }
  }

  get structure() {
    const currentSelection = this.controller.state.selection;
    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      currentSelection.from,
      currentSelection.to
    );

    const documentMatches = limitedDatastore
      .match(null, 'a')
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
      const structure = unwrap(documentMatches.nodes.pop()).node;
      const structureUri = structure.attrs['resource'] as string;
      const headingMatch = limitedDatastore
        .match(`>${structureUri}`, '>https://say.data.gift/ns/heading')
        .asPredicateNodeMapping()
        .single();
      if (headingMatch && headingMatch.nodes && headingMatch.nodes.length) {
        return structure;
      }
    }
    return;
  }

  get structureUri() {
    return this.structure?.attrs['resource'] as string | undefined;
  }

  get structureTypeSelected() {
    const structureTypeof = this.structure?.attrs['typeof'] as
      | string
      | undefined;
    if (structureTypeof) {
      return this.args.widgetArgs.options.structures.find((structure) =>
        structureTypeof.includes(structure.type)
      );
    }
  }

  get isOutsideStructure() {
    return !this.structureUri;
  }

  canMoveDown = trackedFunction(async () => {
    return this.args.controller.canExecuteCommand(
      'move-structure-v2',
      this.args.controller,
      this.structureUri,
      false,
      this.args.widgetArgs.options
    );
  });

  canMoveUp = trackedFunction(async () => {
    return await this.args.controller.canExecuteCommand(
      'move-structure-v2',
      this.args.controller,
      this.structureUri,
      true,
      this.args.widgetArgs.options
    );
  });
}
