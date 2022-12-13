import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import factory from 'rdf-ext';
import { Readable } from 'stream-browserify';
import process from 'process';
import { PNode, ProseController } from '@lblod/ember-rdfa-editor/addon';
import { Command } from 'prosemirror-state';
import { Structure } from '../utils/article-structure-plugin/constants';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import {
  children,
  nodesBetween,
} from '@lblod/ember-rdfa-editor/addon/utils/position-utils';
import recalculateStructureNumbersV2 from './recalculate-structure-numbers-command-v2';
import { unwrap } from '@lblod/ember-rdfa-editor/addon/utils/option';

export class MoveStructureCommandV2 {
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
      if (nodeToInsert) {
        return true;
      } else {
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
}

export default function moveStructureV2(
  controller: ProseController,
  structureURI: string,
  moveUp: boolean,
  options: {
    structures: Structure[];
    structureTypes: string[];
  },
  report: ValidationReport
): Command {
  return (state, dispatch) => {
    const structureNode = controller.datastore
      .match(`>${structureURI}`)
      .asSubjectNodeMapping()
      .single()?.nodes[0];
    if (!structureNode) {
      return false;
    }
    const currentStructure = options.structures.filter;
    const currentStructure = options.structures[currentStructureIndex];

    const resolvedStructurePos = state.doc.resolve(structureNode.pos);
    const structureContainer = resolvedStructurePos.parent;
    const structures = [
      ...children(
        { node: structureContainer, pos: resolvedStructurePos.before() },
        false,
        false,
        (node) => !node.isText
      ),
    ];
    const structureIndex = structures.findIndex(
      (structure) => structure.node === structureNode.node
    );
    if (
      ((structureIndex !== 0 && moveUp) ||
        (structureIndex !== structures.length - 1 && !moveUp)) &&
      structures.length > 1
    ) {
      if (dispatch) {
        const structureA = unwrap(structures[structureIndex]);
        const bIndex = moveUp ? structureIndex - 1 : structureIndex + 1;
        const structureB = unwrap(structures[bIndex]);
        const structureARange = {
          from: structureA.pos,
          to: structureA.pos + structureA.node.nodeSize,
        };
        const structureBRange = {
          from: structureB.pos,
          to: structureB.pos + structureB.node.nodeSize,
        };
        const tr = state.tr;
        tr.replaceRangeWith(
          structureBRange.from,
          structureBRange.to,
          structureA.node
        );
        tr.replaceRangeWith(
          structureARange.from,
          structureARange.to,
          structureB.node
        );
        dispatch(tr);

        controller.executeCommand(
          'recalculate-structure-numbers-v2',
          controller,
          structureContainer,
          currentStructure,
          options
        );
        controller.doCommand(
          recalculateStructureNumbersV2(
            controller,
            null,
            currentStructure,
            options
          )
        );
        recalculateContinuousStructures(controller, options);
        // this.model.change(() => {
        //   const heading = structureAToInsert.children.find(
        //     (child) => child.getAttribute('property') === 'say:heading'
        //   );
        //   const range = controller.rangeFactory.fromInElement(heading, 0, 0);
        //   controller.selection.selectRange(range);
        // });
      }

      return true;
    } else {
      // window.process = process;
      const urisNotAllowedToInsert = report.results.map(
        (result) => result.focusNode?.value
      );
      const filterFunction = (node: PNode) => {
        const nodeUri = node.attrs['resource'] as string;
        return !!nodeUri && !urisNotAllowedToInsert.includes(nodeUri);
      };
      const nodeToInsert = nodesBetween(
        resolvedStructurePos,
        false,
        moveUp,
        filterFunction
      ).next();
      if (!nodeToInsert) {
        return false;
      }

      return true;
    }
  };
}

function recalculateContinuousStructures(
  controller: ProseController,
  options: {
    structures: Structure[];
    structureTypes: string[];
  }
) {
  for (const structure of options.structures) {
    if (structure.numbering === 'continuous') {
      controller.doCommand(
        recalculateStructureNumbersV2(controller, null, structure, options)
      );
    }
  }
}
