import { Node, EditorState } from '@lblod/ember-rdfa-editor';
import { DOMParser as ProseParser } from '@lblod/ember-rdfa-editor';
import {
  transactionCombinator,
  type TransactionCombinatorResult,
} from '@lblod/ember-rdfa-editor/utils/transaction-utils';

type PlaceholderWithPos = {
  placeholder: Node;
  pos: number;
};

type ReplacementValues = {
  [key: string]: string;
};

export default function replaceLockedPlaceholderContent(
  initialState: EditorState,
  values: ReplacementValues | ((state: EditorState) => ReplacementValues),
): TransactionCombinatorResult<boolean> {
  const doc = initialState.doc;
  const placeholdersWithPos: PlaceholderWithPos[] = [];
  doc.descendants((node, pos) => {
    if (
      node.type.name === 'block_locked_placeholder' ||
      node.type.name === 'inline_locked_placeholder'
    ) {
      placeholdersWithPos.push({
        placeholder: node,
        pos: pos,
      });
      return false;
    }
    return true;
  });
  placeholdersWithPos.reverse();
  const monads = [];
  const valuesResolved =
    typeof values === 'function' ? values(initialState) : values;
  for (const { placeholder, pos } of placeholdersWithPos) {
    const key = placeholder.attrs.key as string;
    const valueToReplace = valuesResolved[key];
    if (!valueToReplace) continue;
    if (typeof valueToReplace === 'string') {
      const monad = replacePlaceholderWithHtml(
        placeholder,
        pos,
        valueToReplace,
      );
      monads.push(monad);
    } else {
      const monad = replacePlaceholderWithProsemirrorNode(
        placeholder,
        pos,
        valueToReplace,
      );
      monads.push(monad);
    }
  }
  return transactionCombinator<boolean>(initialState)(monads);
}

function replacePlaceholderWithHtml(
  placeholder: Node,
  pos: number,
  value: string,
) {
  return (state: EditorState) => {
    const domParser = new DOMParser();
    const contentFragment = ProseParser.fromSchema(state.schema).parseSlice(
      domParser.parseFromString(value, 'text/html'),
    ).content;
    const tr = state.tr;
    tr.replaceWith(pos, pos + placeholder.nodeSize, contentFragment);
    return { initialState: state, transaction: tr, result: true };
  };
}

function replacePlaceholderWithProsemirrorNode(
  placeholder: Node,
  pos: number,
  value: Node,
) {
  return (state: EditorState) => {
    const tr = state.tr;
    tr.replaceWith(pos, pos + placeholder.nodeSize, value);
    return { initialState: state, transaction: tr, result: true };
  };
}
