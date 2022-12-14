import { PNode, ProseController } from '@lblod/ember-rdfa-editor';
import { Command } from 'prosemirror-state';
import { Structure } from '../utils/article-structure-plugin/constants';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import {
  children,
  nodesBetween,
} from '@lblod/ember-rdfa-editor/utils/position-utils';
import recalculateStructureNumbersV2 from './recalculate-structure-numbers-command-v2';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

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

    const resolvedStructurePos = state.doc.resolve(structureNode.pos);
    const structureContainer = resolvedStructurePos.parent;
    const structureContainerPos = resolvedStructurePos.before();
    const structures = [
      ...children(
        { node: structureContainer, pos: structureContainerPos },
        false,
        false,
        ({ node }) => !node.isText
      ),
    ];
    const structureIndex = structures.findIndex(
      (structure) => structure.node === structureNode.node
    );
    const currentStructureType = controller.datastore
      .match(`>${structureURI}`, 'a')
      .asQuadResultSet()
      .first()?.object.value;
    const currentStructureIndex = options.structures.findIndex(
      (structure) => structure.type === currentStructureType
    );
    const currentStructure = unwrap(options.structures[currentStructureIndex]);
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
        const structureContainer = unwrap(
          controller.state.doc.nodeAt(structureContainerPos)
        );
        const containerRange = {
          from: structureContainerPos,
          to: structureContainerPos + structureContainer.nodeSize,
        };
        controller.doCommand(
          recalculateStructureNumbersV2(
            controller,
            containerRange,
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
      const urisNotAllowedToInsert = report.results.map(
        (result) => result.focusNode?.value
      );
      const filterFunction = ({ node }: { node: PNode }) => {
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
