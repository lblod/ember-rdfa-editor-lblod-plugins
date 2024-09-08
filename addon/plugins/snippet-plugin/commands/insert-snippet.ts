import { Command, ProseParser, Schema, Slice } from '@lblod/ember-rdfa-editor';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { recalculateNumbers } from '../../structure-plugin/recalculate-structure-numbers';
import { v4 as uuidv4 } from 'uuid';
export interface InsertSnippetCommandArgs {
  content: string;
  title: string;
  assignedSnippetListsIds: string[];
  range?: { start: number; end: number };
}
const insertSnippet = ({
  content,
  title,
  assignedSnippetListsIds,
  range,
}: InsertSnippetCommandArgs): Command => {
  return (state, dispatch) => {
    const domParser = new DOMParser();
    const parsed = domParser.parseFromString(content, 'text/html').body;
    const documentDiv = parsed.querySelector('div[data-say-document="true"]');

    const schema = state.schema;

    const parser = ProseParser.fromSchema(schema);

    let tr = state.tr;
    const insertRange = range ?? {
      start: state.selection.from,
      end: state.selection.to,
    };

    if (documentDiv) {
      const node = schema.node(
        'snippet',
        {
          assignedSnippetListsIds,
          title: title,
          subject: `http://data.lblod.info/snippets/${uuidv4()}`,
        },
        htmlToDoc(content, {
          schema,
          parser,
        }).content,
      );

      tr = transactionCombinator(
        state,
        tr.replaceRangeWith(insertRange.start, insertRange.end, node),
      )([recalculateNumbers]).transaction;
    } else {
      const slice = createSliceFromElement(parsed, schema);
      tr = transactionCombinator(
        state,
        tr.replaceRange(insertRange.start, insertRange.end, slice),
      )([recalculateNumbers]).transaction;
    }
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
