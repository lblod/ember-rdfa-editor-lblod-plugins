import { ProseController } from '@lblod/ember-rdfa-editor';
import { ResolvedArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { Command } from 'prosemirror-state';
import recalculateStructureNumbers from './recalculate-structure-numbers';

export default function deleteStructure(
  controller: ProseController,
  uri: string,
  options: ResolvedArticleStructurePluginOptions
): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const structureToDeleteRange = [
        ...controller.datastore.match(`>${uri}`).asSubjectNodeMapping().nodes(),
      ][0];
      const structureToDeleteTypes = [
        ...controller.datastore
          .match(`>${uri}`, 'a')
          .asQuadResultSet()
          .map((quad) => quad.object.value),
      ];
      if (!structureToDeleteRange) {
        throw new Error(`No node found for resource ${uri}`);
      }
      if (!structureToDeleteTypes) {
        throw new Error(`No type found for resource ${uri}`);
      }

      const resolvedPos = state.doc.resolve(structureToDeleteRange.from);
      const container = resolvedPos.parent;
      let containerRange = {
        from: resolvedPos.before(),
        to: resolvedPos.before() + container.nodeSize,
      };
      const tr = state.tr;
      if (container.childCount === 1) {
        const placeholder = controller.schema.node('placeholder', {
          placeholderText: 'Voer inhoud in',
        });
        tr.replaceRangeWith(
          structureToDeleteRange.from,
          structureToDeleteRange.to,
          placeholder
        );
      } else {
        tr.delete(structureToDeleteRange.from, structureToDeleteRange.to);
      }
      dispatch(tr);
      containerRange = {
        from: tr.mapping.map(containerRange.from),
        to: tr.mapping.map(containerRange.to),
      };
      const currentStructureIndex = options.structures.findIndex((structure) =>
        structureToDeleteTypes.includes(structure.type)
      );
      const currentStructure = unwrap(
        options.structures[currentStructureIndex]
      );
      controller.doCommand(
        recalculateStructureNumbers(
          controller,
          containerRange,
          currentStructure,
          options
        )
      );
      recalculateContinuousStructures(controller, options);
    }
    return true;
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
