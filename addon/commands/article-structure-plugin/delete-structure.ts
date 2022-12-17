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
      const subjectNode = [
        ...controller.datastore.match(`>${uri}`).asSubjectNodeMapping().nodes(),
      ][0];
      if (!subjectNode) {
        throw new Error(`No node found for resource ${uri}`);
      }
      const { node, pos } = subjectNode;
      const resolvedPos = state.doc.resolve(pos);
      const container = resolvedPos.parent;
      let containerRange = {
        from: resolvedPos.before(),
        to: resolvedPos.before() + container.nodeSize,
      };
      const removalRange = { from: pos, to: pos + node.nodeSize };
      const tr = state.tr;
      if (container.childCount === 1) {
        const placeholder = controller.schema.node('placeholder', {
          placeholderText: 'Voer inhoud in',
        });
        tr.replaceRangeWith(removalRange.from, removalRange.to, placeholder);
      } else {
        tr.delete(removalRange.from, removalRange.to);
      }
      dispatch(tr);
      containerRange = {
        from: tr.mapping.map(containerRange.from),
        to: tr.mapping.map(containerRange.to),
      };
      const currentStructureType = node.attrs['typeof'] as string;
      const currentStructureIndex = options.structures.findIndex((structure) =>
        currentStructureType.includes(structure.type)
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
