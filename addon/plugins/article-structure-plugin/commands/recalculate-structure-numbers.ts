import { ProseController } from '@lblod/ember-rdfa-editor';
import defaults from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/defaults';
import { Command } from 'prosemirror-state';
import { ProseStore } from '@lblod/ember-rdfa-editor/utils/datastore/prose-store';
import { expect } from '@lblod/ember-rdfa-editor/utils/option';
import {
  ResolvedArticleStructurePluginOptions,
  StructureSpec,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';

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
          containerRange.to,
          'rangeContains'
        );
      } else {
        datastore = controller.datastore;
      }
      const structureMatch = [
        ...datastore
          .match(null, 'a', `>${structureType.type}`)
          .transformDataset((dataset) => {
            return dataset.filter((quad) => {
              return options.structureTypes.includes(quad.object.value);
            });
          })
          .asSubjectNodeMapping(),
      ];
      const structures = structureMatch.map((match) => {
        return {
          uri: match.term.value,
          range: match.nodes[0],
        };
      });
      if (!structures.length) return true;
      for (let i = 0; i < structures.length; i++) {
        replaceNumberIfNeeded(controller, structures[i], i, structureType);
      }
    }
    return true;
  };
}

function replaceNumberIfNeeded(
  controller: ProseController,
  structure: { range: { from: number; to: number }; uri: string },
  index: number,
  structureType: StructureSpec
) {
  const numberPredicate =
    structureType.numberPredicate || defaults.numberPredicate;
  let structureNumberObjectNode = controller.datastore
    .match(`>${structure.uri}`, `>${numberPredicate}`)
    .asObjectNodeMapping()
    .single();
  structureNumberObjectNode = expect(
    `${structure.uri} expected to have the predicate ${numberPredicate}`,
    structureNumberObjectNode
  );
  const structureNumber = structureNumberObjectNode.term.value;
  const structureNumberElement = structureNumberObjectNode.nodes[0];
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
    controller.withTransaction((tr) => {
      return tr.insertText(String(structureNumberExpected), from, to);
    });
  }
}
