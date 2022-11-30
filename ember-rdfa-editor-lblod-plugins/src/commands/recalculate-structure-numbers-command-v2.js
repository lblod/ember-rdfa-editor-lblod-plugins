export default class RecalculateStructureNumbersCommandV2 {
  name = 'recalculate-structure-numbers-v2';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, container, structureType, options) {
    let datastore;
    if (structureType.numbering !== 'continuous') {
      datastore = controller.datastore.limitToRange(
        controller.rangeFactory.fromAroundNode(container),
        'rangeContains'
      );
    } else {
      datastore = controller.datastore;
    }
    const structures = datastore
      .match(null, 'a', `>${structureType.type}`)
      .transformDataset((dataset) => {
        return dataset.filter((quad) => {
          return options.structureTypes.includes(quad.object.value);
        });
      })
      .asPredicateNodes()
      .next().value;
    if (!structures) return;
    const structuresArray = [...structures.nodes];
    for (let i = 0; i < structuresArray.length; i++) {
      const structure = structuresArray[i];
      this.replaceNumberIfNeeded(controller, structure, i, structureType);
    }
  }
  replaceNumberIfNeeded(controller, structure, index, structureType) {
    const structureNumberObjectNode = controller.datastore
      .match(
        `>${structure.getAttribute('resource')}`,
        `>${structureType.numberPredicate}`,
        null
      )
      .asObjectNodes()
      .next().value;
    const structureNumber = structureNumberObjectNode.object.value;
    const structureNumberElement = [...structureNumberObjectNode.nodes][0];
    let structureNumberExpected;
    if (structureType.numberingFunction) {
      structureNumberExpected = structureType.numberingFunction(index + 1);
    } else {
      structureNumberExpected = index + 1;
    }
    if (structureNumber !== structureNumberExpected) {
      controller.executeCommand(
        'insert-text',
        String(structureNumberExpected),
        controller.rangeFactory.fromInNode(
          structureNumberElement,
          0,
          structureNumberElement.getMaxOffset()
        )
      );
    }
  }
}
