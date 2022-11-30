import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import factory from 'rdf-ext';
import { Readable } from 'stream-browserify';
import process from 'process';

export default class MoveStructureCommandV2 {
  name = 'move-structure-v2';

  constructor(model) {
    this.model = model;
  }

  async canExecute(controller, structureUri, moveUp, options) {
    const structureSubjectNode = controller.datastore
      .match(`>${structureUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const structureNode = [...structureSubjectNode.nodes][0];
    const structureContainer = structureNode.parent;
    const structures = structureContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const structureIndex = structures.findIndex(
      (structure) => structure === structureNode
    );
    if (
      ((structureIndex !== 0 && moveUp) ||
        (structureIndex !== structures.length - 1 && !moveUp)) &&
      structures.length > 1
    ) {
      return true;
    } else {
      const currentStructureType = controller.datastore
        .match(`>${structureUri}`, 'a', null)
        .asQuads()
        .next().value.object.value;
      const currentStructureIndex = options.structures.findIndex(
        (structure) => structure.type === currentStructureType
      );
      const currentStructure = options.structures[currentStructureIndex];
      const shaclConstraint = currentStructure.shaclConstraint;
      window.process = process;
      const s = new Readable();
      s._read = () => {};
      s.push(shaclConstraint);
      s.push(null);
      const parser = new ParserN3({ factory });
      const shapes = await factory.dataset().import(parser.import(s));
      const data = controller.datastore._dataset;
      const validator = new SHACLValidator(shapes, { factory });
      const report = await validator.validate(data);
      const urisNotAllowedToInsert = report.results.map(
        (result) => result.focusNode.value
      );
      const treeWalker = new controller.treeWalkerFactory({
        root: controller.modelRoot,
        start: structureNode,
        end: controller.modelRoot,
        reverse: moveUp,
        filter: (node) => {
          const nodeUri = node.getAttribute('resource');
          if (nodeUri && !urisNotAllowedToInsert.includes(nodeUri)) {
            return 0;
          }
          return 1;
        },
      });
      const nodeToInsert = treeWalker.nextNode();
      console.log(nodeToInsert);
      if (nodeToInsert) {
        console.log('true');
        return true;
      } else {
        console.log('false');
        return false;
      }
    }
  }

  async execute(controller, structureUri, moveUp, options) {
    const structureSubjectNode = controller.datastore
      .match(`>${structureUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const structureNode = [...structureSubjectNode.nodes][0];
    const structureContainer = structureNode.parent;
    const structures = structureContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const currentStructureType = controller.datastore
      .match(`>${structureUri}`, 'a', null)
      .asQuads()
      .next().value.object.value;
    const structureIndex = structures.findIndex(
      (structure) => structure === structureNode
    );
    const currentStructureIndex = options.structures.findIndex(
      (structure) => structure.type === currentStructureType
    );
    const currentStructure = options.structures[currentStructureIndex];
    if (
      ((structureIndex !== 0 && moveUp) ||
        (structureIndex !== structures.length - 1 && !moveUp)) &&
      structures.length > 1
    ) {
      const structureA = structures[structureIndex];
      const bIndex = moveUp ? structureIndex - 1 : structureIndex + 1;
      const structureB = structures[bIndex];

      const structureARange =
        controller.rangeFactory.fromAroundNode(structureA);
      const structureBRange =
        controller.rangeFactory.fromAroundNode(structureB);
      const structureAToInsert = structureA.clone();
      const structureBToInsert = structureB.clone();
      this.model.change((mutator) => {
        mutator.insertNodes(structureBRange, structureAToInsert);
        mutator.insertNodes(structureARange, structureBToInsert);
      });
      controller.executeCommand(
        'recalculate-structure-numbers-v2',
        controller,
        structureContainer,
        currentStructure,
        options
      );
      this.recalculateContinuousStructures(controller, options);
      this.model.change(() => {
        const heading = structureAToInsert.children.find(
          (child) => child.getAttribute('property') === 'say:heading'
        );
        const range = controller.rangeFactory.fromInElement(heading, 0, 0);
        controller.selection.selectRange(range);
      });
    } else {
      // Find next parent structure up the chain
      const currentStructureIndex = options.structures.findIndex(
        (structure) => structure.type === currentStructureType
      );
      const currentStructure = options.structures[currentStructureIndex];
      const shaclConstraint = currentStructure.shaclConstraint;
      window.process = process;
      const s = new Readable();
      s._read = () => {};
      s.push(shaclConstraint);
      s.push(null);
      const parser = new ParserN3({ factory });
      const shapes = await factory.dataset().import(parser.import(s));
      const data = controller.datastore._dataset;
      const validator = new SHACLValidator(shapes, { factory });
      const report = await validator.validate(data);
      const urisNotAllowedToInsert = report.results.map(
        (result) => result.focusNode.value
      );
      const treeWalker = new controller.treeWalkerFactory({
        root: controller.modelRoot,
        start: structureNode,
        end: controller.modelRoot,
        reverse: moveUp,
        filter: (node) => {
          const nodeUri = node.getAttribute('resource');
          if (nodeUri && !urisNotAllowedToInsert.includes(nodeUri)) {
            return 0;
          }
          return 1;
        },
      });
      const nodeToInsert = treeWalker.nextNode();
      if (nodeToInsert) {
        //Insert structure last place in that structure
        const structureContent = nodeToInsert.children.filter(
          (child) => child.getAttribute('property') === 'say:body'
        )[0];
        let insertRange;
        if (
          structureContent.children.length === 1 &&
          structureContent.children[0].getAttribute('class') ===
            'mark-highlight-manual'
        ) {
          insertRange = controller.rangeFactory.fromInNode(
            structureContent,
            0,
            structureContent.getMaxOffset()
          );
        } else {
          insertRange = controller.rangeFactory.fromInNode(
            structureContent,
            structureContent.getMaxOffset(),
            structureContent.getMaxOffset()
          );
        }
        const originalContainer = structureNode.parent;
        const insertStructure = structureNode.clone();
        this.model.change((mutator) => {
          mutator.insertNodes(insertRange, insertStructure);
          mutator.deleteNode(structureNode);
        });
        if (originalContainer.children.length === 0) {
          controller.executeCommand(
            'insert-html',
            '<span class="mark-highlight-manual">Voer inhoud in</span>',
            controller.rangeFactory.fromInNode(
              originalContainer,
              0,
              originalContainer.getMaxOffset()
            )
          );
        }
        controller.executeCommand(
          'recalculate-structure-numbers-v2',
          controller,
          structureContainer,
          currentStructure,
          options
        );
        controller.executeCommand(
          'recalculate-structure-numbers-v2',
          controller,
          structureContent,
          currentStructure,
          options
        );
        this.recalculateContinuousStructures(controller, options);
        this.model.change(() => {
          const heading = insertStructure.children.find(
            (child) => child.getAttribute('property') === 'say:heading'
          );
          const range = controller.rangeFactory.fromInElement(heading, 0, 0);
          controller.selection.selectRange(range);
        });
      }
    }
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
