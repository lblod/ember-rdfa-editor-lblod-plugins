export default class DeleteNodeFromUriCommand {
  name = 'delete-node-from-uri';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, uri, type, options) {
    const subjectNode = controller.datastore
      .match(`>${uri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const node = [...subjectNode.nodes][0];
    const container = node.parent;
    this.model.change((mutator) => {
      mutator.deleteNode(node);
    });
    if (container.children.length === 0) {
      controller.executeCommand(
        'insert-html',
        '<span class="mark-highlight-manual">Voer inhoud in</span>',
        controller.rangeFactory.fromInNode(
          container,
          0,
          container.getMaxOffset()
        )
      );
    }
    const currentStructureType = node.getAttribute('typeof');
    const currentStructureIndex = options.structures.findIndex((structure) =>
      currentStructureType.includes(structure.type)
    );
    const currentStructure = options.structures[currentStructureIndex];
    controller.executeCommand(
      'recalculate-structure-numbers-v2',
      controller,
      container,
      currentStructure,
      options
    );
    this.recalculateContinuousStructures(controller, options);
  }
  recalculateContinuousStructures(controller, options) {
    for (let structure of options.structures) {
      if (structure.numbering === 'continuous') {
        controller.executeCommand(
          'recalculate-structure-numbers-v2',
          controller,
          null,
          structure,
          options
        );
      }
    }
  }
}
