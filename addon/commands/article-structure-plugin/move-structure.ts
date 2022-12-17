/* eslint-disable prettier/prettier */
import {
  PNode,
  ProseController,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { Command } from 'prosemirror-state';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import {
  children,
  nodesBetween,
} from '@lblod/ember-rdfa-editor/utils/position-utils';
import recalculateStructureNumbers from './recalculate-structure-numbers';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/utils/datastore/prose-store';
import { ResolvedArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';

export default function moveStructure(
  controller: ProseController,
  structureURI: string,
  moveUp: boolean,
  options: ResolvedArticleStructurePluginOptions,
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
        let structureA: ResolvedPNode;
        let structureB: ResolvedPNode;
        if (moveUp) {
          structureA = unwrap(structures[structureIndex - 1]);
          structureB = unwrap(structures[structureIndex]);
        } else {
          structureA = unwrap(structures[structureIndex]);
          structureB = unwrap(structures[structureIndex + 1]);
        }
        const structureBRange = {
          from: structureB.pos,
          to: structureB.pos + structureB.node.nodeSize,
        };
        controller.withTransaction((tr) => {
          tr.delete(structureBRange.from, structureBRange.to);
          return tr.replaceRangeWith(structureA.pos, structureA.pos, structureB.node);
        });
        const structureContainer = unwrap(
          controller.state.doc.nodeAt(structureContainerPos)
        );
        const containerRange = {
          from: structureContainerPos,
          to: structureContainerPos + structureContainer.nodeSize,
        };
        controller.doCommand(
          recalculateStructureNumbers(
            controller,
            containerRange,
            currentStructure,
            options
          )
        );
        recalculateContinuousStructures(controller, options);
        const heading = unwrap([
          ...controller.datastore
            .match(`>${structureURI}`, 'ext:title')
            .asPredicateNodeMapping()
            .nodes(),
        ][0]);
        const newSelection = TextSelection.near(
          controller.state.doc.resolve(heading.pos + heading.node.nodeSize)
        );
        controller.withTransaction((tr) => {
          return tr.setSelection(newSelection);
        });
        controller.focus();
      }

      return true;
    } else {
      const urisNotAllowedToInsert = report.results.map(
        (result) => result.focusNode?.value
      );
      const filterFunction = ({ node }: { node: PNode }) => {
        const resolvedContainerPos = controller.state.doc.resolve(structureContainerPos);
        const parent = resolvedContainerPos.parent;
        const nodeUri = node.attrs['resource'] as string;

        if(parent.attrs['resource'] === nodeUri) {
          return false;
        }
        return !!nodeUri && !urisNotAllowedToInsert.includes(nodeUri);
      };
      const nodeToInsert = nodesBetween(
        resolvedStructurePos,
        true,
        moveUp,
        filterFunction
      ).next().value;
      if (!nodeToInsert) {
        return false;
      }
      //Insert structure last place in that structure
      let structureContent;
      if (currentStructure.insertPredicate) {
        structureContent = children(nodeToInsert, false, false, ({ node: child}) => child.attrs['property'] === currentStructure.insertPredicate?.short).next().value;
      } else {
        structureContent = nodeToInsert;
      }
      if(!structureContent){
        return false;
      }
      if(dispatch){
        let insertRange: {from: number, to: number};
        if (
          structureContent.node.childCount === 1 &&
          structureContent.node.child(0).childCount === 1 &&
          structureContent.node.child(0).child(0).type ===
          controller.schema.nodes['placeholder']
        ) {
          insertRange = {from: structureContent.pos + 1, to: structureContent.pos + structureContent.node.nodeSize - 1};
        } else {
          insertRange = {from: structureContent.pos + structureContent.node.nodeSize - 1, to: structureContent.pos + structureContent.node.nodeSize - 1};
        }
        
        let mappedStructureNodePos: number | undefined;
        controller.withTransaction((tr) => {
          tr.replaceRangeWith(insertRange.from, insertRange.to, structureNode.node);
          mappedStructureNodePos = tr.mapping.map(structureNode.pos);
          return tr.delete(mappedStructureNodePos, mappedStructureNodePos + structureNode.node.nodeSize);
        });
        const resolvedStructureNodePos = controller.state.doc.resolve(unwrap(mappedStructureNodePos));
        const originalContainer = resolvedStructureNodePos.parent;
        let originalContainerPos = unwrap(resolvedStructureNodePos.pos);
        if (originalContainer.childCount === 0) {
          controller.withTransaction((tr) => {
            return tr.replaceRangeWith(originalContainerPos, originalContainerPos, controller.schema.node('placeholder', { placeholderText: 'Voer inhoud in'}));
          });
        }
        originalContainerPos = unwrap(resolvedStructureNodePos.before());
        
        const originalContainerUri = resolvedStructureNodePos.node(resolvedStructureNodePos.depth - 1).attrs['resource'] as string;
        const newContainerUri = nodeToInsert.node.attrs['resource'] as string;
  
        const originalContainerNode = unwrap([...controller.datastore.match(`>${originalContainerUri}`).asSubjectNodeMapping().nodes()][0]);
        const newContainerNode = unwrap([...controller.datastore.match(`>${newContainerUri}`).asSubjectNodeMapping().nodes()][0]);
        controller.doCommand(
          recalculateStructureNumbers(
            controller, 
            { from: originalContainerNode.pos, to: originalContainerNode.pos + originalContainerNode.node.nodeSize}, 
            currentStructure,
            options
          )
        );
        controller.doCommand(
          recalculateStructureNumbers(
            controller, 
            { from: newContainerNode.pos, to: newContainerNode.pos + newContainerNode.node.nodeSize}, 
            currentStructure,
            options
          )
        );
        recalculateContinuousStructures(controller, options);
        const heading = unwrap([
          ...controller.datastore
            .match(`>${structureURI}`, 'ext:title')
            .asPredicateNodeMapping()
            .nodes(),
        ][0]);
        const newSelection = TextSelection.near(
          controller.state.doc.resolve(heading.pos + heading.node.nodeSize)
        );
        controller.withTransaction((tr) => {
          return tr.setSelection(newSelection);
        });
        controller.focus();
      }
      
      return true;
    }
  };
}

function recalculateContinuousStructures(
  controller: ProseController,
  options: ResolvedArticleStructurePluginOptions
) {
  for (const structure of options.structures) {
    if (structure.numbering === 'continuous') {
      controller.doCommand(
        recalculateStructureNumbers(controller, null, structure, options)
      );
    }
  }
}
