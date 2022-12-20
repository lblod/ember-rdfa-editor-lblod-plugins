import { ProseController } from '@lblod/ember-rdfa-editor';
import defaults from '@lblod/ember-rdfa-editor-lblod-plugins/utils/article-structure-plugin/defaults';
import { Command } from 'prosemirror-state';
import { ProseStore } from '@lblod/ember-rdfa-editor/utils/datastore/prose-store';
import { expect, unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import {
  ResolvedArticleStructurePluginOptions,
  StructureSpec,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { getRdfaAttributes } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';

export default function recalculateStructureNumbers(
  controller: ProseController,
  containerRange: { from: number; to: number } | undefined | null,
  structureType: StructureSpec,
  options: ResolvedArticleStructurePluginOptions
): Command {
  return (_state, dispatch) => {
    if (dispatch) {
      let datastore: ProseStore;
      if (structureType.numbering !== 'continuous' && containerRange) {
        datastore = controller.datastore.limitToRange(
          controller.state,
          containerRange.from,
          containerRange.to
        );
      } else {
        datastore = controller.datastore;
      }
      const structures = [
        ...datastore
          .match(null, 'a', `>${structureType.type}`)
          .transformDataset((dataset) => {
            return dataset.filter((quad) => {
              return options.structureTypes.includes(quad.object.value);
            });
          })
          .asPredicateNodeMapping()
          .nodes(),
      ];
      if (!structures) return true;
      // Temporary workaround: for some reason structures contains each structure twice.
      const structuresFiltered = structures.filter(
        (node, index) => index === structures.indexOf(node)
      );
      for (let i = 0; i < structuresFiltered.length; i++) {
        const structure = unwrap(structuresFiltered[i]);
        replaceNumberIfNeeded(controller, structure, i, structureType);
      }
    }
    return true;
  };
}

function replaceNumberIfNeeded(
  controller: ProseController,
  structure: { from: number; to: number },
  index: number,
  structureType: StructureSpec
) {
  const numberPredicate =
    structureType.numberPredicate || defaults.numberPredicate;
  const resource = unwrap(
    getRdfaAttributes(unwrap(controller.state.doc.nodeAt(structure.from)))
      ?.resource
  );
  let structureNumberObjectNode = controller.datastore
    .match(`>${resource}`, `>${numberPredicate}`)
    .asObjectNodeMapping()
    .single();
  structureNumberObjectNode = expect(
    `${resource} expected to have the predicate ${numberPredicate}`,
    structureNumberObjectNode
  );
  const structureNumber = structureNumberObjectNode.term.value;
  const structureNumberElement = [...structureNumberObjectNode.nodes][0];
  if (!structureNumberElement) {
    throw new Error('Could not find object node');
  }
  let structureNumberExpected: string;
  if (structureType.numberingFunction) {
    structureNumberExpected = structureType.numberingFunction(index + 1);
  } else {
    structureNumberExpected = (index + 1).toString();
  }
  if (structureNumber !== structureNumberExpected) {
    const { from, to } = structureNumberElement;
    const insertRange = { from: from + 1, to: to - 1 };
    controller.withTransaction((tr) => {
      return tr.insertText(
        String(structureNumberExpected),
        insertRange.from,
        insertRange.to
      );
    });
  }
}
