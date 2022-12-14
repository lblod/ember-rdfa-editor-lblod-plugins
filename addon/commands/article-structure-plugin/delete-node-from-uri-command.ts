import { ProseController } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { Command } from 'prosemirror-state';
import { Structure } from '../../utils/article-structure-plugin/constants';
import recalculateStructureNumbers from './recalculate-structure-numbers';

export default function deleteNodeFromURI(
  controller: ProseController,
  uri: string,
  type: string,
  options: {
    structures: Structure[];
    structureTypes: string[];
  }
): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const subjectNode = controller.datastore
        .match(`>${uri}`)
        .asSubjectNodeMapping()
        .single()?.nodes[0];
      if (!subjectNode?.pos) {
        throw new Error(`No node found for resource ${uri}`);
      }
      const { node, pos } = subjectNode;
      const resolvedPos = state.doc.resolve(pos);
      const container = resolvedPos.parent;
      let containerRange = {
        from: resolvedPos.before(),
        to: resolvedPos.before() + node.nodeSize,
      };
      const from = resolvedPos.pos;
      const to = resolvedPos.pos + subjectNode.node.nodeSize;
      const tr = state.tr;
      if (container.childCount === 1) {
        const placeholder = controller.schema.node('placeholder', {
          placeholderText: 'Voer inhoud in',
        });
        tr.replaceRangeWith(from, to, placeholder);
      } else {
        tr.delete(from, to);
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
  options: {
    structures: Structure[];
    structureTypes: string[];
  }
) {
  for (const structure of options.structures) {
    if (structure.numbering === 'continuous') {
      controller.doCommand(
        recalculateStructureNumbers(controller, null, structure, options)
      );
    }
  }
}
