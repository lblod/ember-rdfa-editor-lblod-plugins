import { Command, ProseParser, Schema, Slice } from '@lblod/ember-rdfa-editor';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { addPropertyToNode } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { recalculateNumbers } from '../../structure-plugin/recalculate-structure-numbers';
import { createSnippet } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet';
import { type ImportedResourceMap } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import {
  isSome,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export interface InsertSnippetCommandArgs {
  content: string;
  title: string;
  assignedSnippetListsIds: string[];
  importedResources?: ImportedResourceMap;
  range?: { start: number; end: number };
  allowMultipleSnippets?: boolean;
}

const insertSnippet = ({
  content,
  title,
  assignedSnippetListsIds,
  importedResources,
  range,
  allowMultipleSnippets,
}: InsertSnippetCommandArgs): Command => {
  return (state, dispatch) => {
    const domParser = new DOMParser();
    const parsed = domParser.parseFromString(content, 'text/html').body;
    const documentDiv = parsed.querySelector('div[data-say-document="true"]');

    const schema = state.schema;

    let tr = state.tr;
    const insertRange = range ?? {
      start: state.selection.from,
      end: state.selection.to,
    };

    if (documentDiv) {
      const [snippet, importedTriples] = createSnippet({
        schema: state.schema,
        content,
        title,
        snippetListIds: assignedSnippetListsIds,
        importedResources,
        allowMultipleSnippets,
      });

      const addImportedResourceProperties = Object.values(
        importedResources ?? {},
      )
        .map((linked) => {
          const newProperties =
            (isSome(linked) && importedTriples.get(linked)) || [];
          return newProperties.map((newProp) =>
            addPropertyToNode({
              resource: unwrap(linked),
              property: newProp,
            }),
          );
        })
        .flat();
      tr = transactionCombinator(
        state,
        tr.replaceRangeWith(insertRange.start, insertRange.end, snippet),
      )([recalculateNumbers, ...addImportedResourceProperties]).transaction;
    } else {
      const slice = createSliceFromElement(parsed, schema);
      tr = transactionCombinator(
        state,
        tr.replaceRange(insertRange.start, insertRange.end, slice),
      )([recalculateNumbers]).transaction;
    }
    tr.setMeta('insertSnippet', true);
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  };
};

function createSliceFromElement(element: Element, schema: Schema) {
  return new Slice(
    ProseParser.fromSchema(schema).parse(element, {
      preserveWhitespace: true,
    }).content,
    0,
    0,
  );
}
export default insertSnippet;
