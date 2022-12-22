/* eslint-disable prettier/prettier */
import {
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
import { ResolvedArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { getRdfaAttribute } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
export default function moveStructure(
  controller: ProseController,
  structureURI: string,
  moveUp: boolean,
  options: ResolvedArticleStructurePluginOptions,
  report: ValidationReport
): Command {
  return (state, dispatch) => {
    const structureRange = controller.datastore
      .match(`>${structureURI}`)
      .asSubjectNodeMapping()
      .single()?.nodes[0];
    if (!structureRange) {
      console.warn(`Structure with URI ${structureURI} not found, cancelling move command`);
      return false;
    }

    const resolvedStructurePos = state.doc.resolve(structureRange?.from);
    const structureContainer = resolvedStructurePos.parent;
    let structureContainerRange = { from: resolvedStructurePos.before(), to: resolvedStructurePos.before() + structureContainer.nodeSize};
    const structures = [
      ...findChildren(
        controller.state.doc,
        structureContainerRange.from,
        false,
        false,
        ({ from }) => !controller.state.doc.nodeAt(from)?.isText
      ),
    ];
    const structureIndex = structures.findIndex(
      (structure) => structure.from === structureRange.from && structure.to === structureRange.to
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
        let structureARange: { from: number, to: number };
        let structureBRange: { from: number, to: number };
        if (moveUp) {
          structureARange = unwrap(structures[structureIndex - 1]);
          structureBRange = unwrap(structures[structureIndex]);
        } else {
          structureARange = unwrap(structures[structureIndex]);
          structureBRange = unwrap(structures[structureIndex + 1]);
        }
        const structureBNode = unwrap(controller.state.doc.nodeAt(structureBRange.from));
        controller.withTransaction((tr) => {
          tr.delete(structureBRange.from, structureBRange.to);
          return tr.replaceRangeWith(structureARange.from, structureARange.from, structureBNode);
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
        const headingRange = unwrap([
          ...controller.datastore
            .match(`>${structureURI}`, 'ext:title')
            .asPredicateNodeMapping()
            .nodes(),
        ][0]);
        const newSelection = TextSelection.near(
          controller.state.doc.resolve(headingRange.to)
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
      const structureContainerURI = (getRdfaAttribute(structureContainer, 'resource').pop()) ?? (getRdfaAttribute(resolvedStructurePos.node(resolvedStructurePos.depth - 1), 'resource').pop());
      const filterFunction = ({ from }: { from: number }) => {
        const node = unwrap(controller.state.doc.nodeAt(from));
        const nodeUri = getRdfaAttribute(node, 'resource').pop();
        if(structureContainerURI === nodeUri) {
          return false;
        }
        return !!nodeUri && !urisNotAllowedToInsert.includes(nodeUri);
      };
      // The new structure container we want to move our structure in to.
      let newStructureContainerRange: { from: number, to: number } | void = findNodes(
        controller.state.doc,
        structureRange.from,
        true,
        moveUp,
        filterFunction
      ).next().value;
      if (!newStructureContainerRange) {
        return false;
      }
      const newStructureContainerNode = unwrap(controller.state.doc.nodeAt(newStructureContainerRange.from));

      const newStructureContainerURI = getRdfaAttribute(newStructureContainerNode, 'resource').pop();
      // Check if there is a specific predicate container we need to insert inside
      if (currentStructureSpec.insertPredicate) {
        newStructureContainerRange = findChildren(controller.state.doc, newStructureContainerRange.from, false, false, ({ from }) => getRdfaAttribute(unwrap(controller.state.doc.nodeAt(from)), 'property').pop() === currentStructureSpec.insertPredicate?.short).next().value;
      }
      if(!newStructureContainerRange){
        return false;
      }
      if(dispatch){
        let insertRange: {from: number, to: number};

        // Check if the newStructureContainer we want to insert to only contains a placeholder
        if (
          newStructureContainerNode.childCount === 1 &&
          newStructureContainerNode.child(0).childCount === 1 &&
          newStructureContainerNode.child(0).child(0).type ===
          controller.schema.nodes['placeholder']
        ) {
          insertRange = {from: newStructureContainerRange.from + 1, to: newStructureContainerRange.to - 1};
        } else {
          insertRange = {from: newStructureContainerRange.to - 1, to: newStructureContainerRange.to - 1};
        }
        const structureNode = unwrap(controller.state.doc.nodeAt(structureRange.from));
        controller.withTransaction((tr) => {
          tr.replaceRangeWith(insertRange.from, insertRange.to, structureNode);
          const oldStructureRange = { from: tr.mapping.map(structureRange.from), to: tr.mapping.map(structureRange.to)};
          const replacementNode = structureContainer.childCount === 0 && controller.schema.node('placeholder', { placeholderText: 'Voer inhoud in'});
          if(replacementNode){
            tr.replaceRangeWith(oldStructureRange.from, oldStructureRange.to, replacementNode);
          } else {
            tr.delete(oldStructureRange.from, oldStructureRange.to);
          }
          return tr;
        });
        
        const originalContainerRange = unwrap([...controller.datastore.match(`>${structureContainerURI as string}`).asSubjectNodeMapping().nodes()][0]);
        const newContainerRange = unwrap([...controller.datastore.match(`>${newStructureContainerURI as string}`).asSubjectNodeMapping().nodes()][0]);
        controller.doCommand(
          recalculateStructureNumbers(
            controller, 
            originalContainerRange, 
            currentStructureSpec,
            options
          )
        );
        controller.doCommand(
          recalculateStructureNumbers(
            controller, 
            newContainerRange, 
            currentStructureSpec,
            options
          )
        );
        recalculateContinuousStructures(controller, options);
        const headingRange = unwrap([
          ...controller.datastore
            .match(`>${structureURI}`, 'ext:title')
            .asPredicateNodeMapping()
            .nodes(),
        ][0]);
        const newSelection = TextSelection.near(
          controller.state.doc.resolve(headingRange.to)
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
