/* eslint-disable prettier/prettier */
import {
  PNode,
  ProseController,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { Command } from 'prosemirror-state';
import ValidationReport from 'rdf-validate-shacl/src/validation-report';
import {
  findChildren,
  findNodes,
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
      console.warn(`Structure with URI ${structureURI} not found, cancelling move command`);
      return false;
    }

    const resolvedStructurePos = state.doc.resolve(structureNode.pos);
    const structureContainer = resolvedStructurePos.parent;
    let structureContainerRange = { from: resolvedStructurePos.before(), to: resolvedStructurePos.before() + structureContainer.nodeSize};
    const structures = [
      ...findChildren(
        { node: structureContainer, pos: structureContainerRange.from },
        false,
        false,
        ({ node }) => !node.isText
      ),
    ];
    const structureIndex = structures.findIndex(
      (structure) => structure.node === structureNode.node
    );

    // The type of the structure we want to move
    const currentStructureType = controller.datastore
      .match(`>${structureURI}`, 'a')
      .asQuadResultSet()
      .first()?.object.value;

    // The spec describing the structure we want to move
    const currentStructureSpec = options.structures.find(
      (structureSpec) => structureSpec.type === currentStructureType
    );
    if(!currentStructureSpec){
      return false;
    }
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
          controller.state.doc.nodeAt(structureContainerRange.from)
        );
        structureContainerRange = {
          from: structureContainerRange.from,
          to: structureContainerRange.from + structureContainer.nodeSize,
        };
        controller.doCommand(
          recalculateStructureNumbers(
            controller,
            structureContainerRange,
            currentStructureSpec,
            options
          )
        );
        recalculateContinuousStructures(controller, options);

        // We place our resulting selection in the title of the structure
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
        const resolvedContainerPos = controller.state.doc.resolve(structureContainerRange.from);
        const parent = resolvedContainerPos.parent;
        const nodeUri = node.attrs['resource'] as string;

        if(parent.attrs['resource'] === nodeUri) {
          return false;
        }
        return !!nodeUri && !urisNotAllowedToInsert.includes(nodeUri);
      };
      // The new structure container we want to move our structure in to.
      let newStructureContainer: ResolvedPNode | undefined | void = findNodes(
        resolvedStructurePos,
        true,
        moveUp,
        filterFunction
      ).next().value;
      if (!newStructureContainer) {
        return false;
      }
          // Determine the URI of the container the structure finds itself in, this is either the URI of the container itself or the URI of its parent (if an insertPredicate is defined)
      const structureContainerURI = structureContainer.attrs['resource'] as string ?? resolvedStructurePos.node(resolvedStructurePos.depth - 1).attrs['resource'] as string;
      const newStructureContainerURI = newStructureContainer.node.attrs['resource'] as string;
      // Check if there is a specific predicate container we need to insert inside
      if (currentStructureSpec.insertPredicate) {
        newStructureContainer = findChildren(newStructureContainer, false, false, ({ node: child}) => child.attrs['property'] === currentStructureSpec.insertPredicate?.short).next().value;
      }
      if(!newStructureContainer){
        return false;
      }
      if(dispatch){
        let insertRange: {from: number, to: number};

        // Check if the newStructureContainer we want to insert to only contains a placeholder
        if (
          newStructureContainer.node.childCount === 1 &&
          newStructureContainer.node.child(0).childCount === 1 &&
          newStructureContainer.node.child(0).child(0).type ===
          controller.schema.nodes['placeholder']
        ) {
          insertRange = {from: newStructureContainer.pos + 1, to: newStructureContainer.pos + newStructureContainer.node.nodeSize - 1};
        } else {
          insertRange = {from: newStructureContainer.pos + newStructureContainer.node.nodeSize - 1, to: newStructureContainer.pos + newStructureContainer.node.nodeSize - 1};
        }
        
        controller.withTransaction((tr) => {
          tr.replaceRangeWith(insertRange.from, insertRange.to, structureNode.node);
          const oldStructurePosition = tr.mapping.map(structureNode.pos);
          const replacementNode = structureContainer.childCount === 0 && controller.schema.node('placeholder', { placeholderText: 'Voer inhoud in'});
          if(replacementNode){
            tr.replaceRangeWith(oldStructurePosition, oldStructurePosition + structureNode.node.nodeSize, replacementNode);
          } else {
            tr.delete(oldStructurePosition, oldStructurePosition + structureNode.node.nodeSize);
          }
          return tr;
        });
        
        console.log('ORIGINAL URI: ', structureContainerURI);
        console.log('NEW URI: ', newStructureContainerURI);
        const originalContainerNode = unwrap([...controller.datastore.match(`>${structureContainerURI}`).asSubjectNodeMapping().nodes()][0]);
        const newContainerNode = unwrap([...controller.datastore.match(`>${newStructureContainerURI}`).asSubjectNodeMapping().nodes()][0]);
        controller.doCommand(
          recalculateStructureNumbers(
            controller, 
            { from: originalContainerNode.pos, to: originalContainerNode.pos + originalContainerNode.node.nodeSize}, 
            currentStructureSpec,
            options
          )
        );
        controller.doCommand(
          recalculateStructureNumbers(
            controller, 
            { from: newContainerNode.pos, to: newContainerNode.pos + newContainerNode.node.nodeSize}, 
            currentStructureSpec,
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
