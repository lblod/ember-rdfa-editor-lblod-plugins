import { EditorState } from '@lblod/ember-rdfa-editor';
import {
  TransactionMonad,
  transactionCombinator,
} from '@lblod/ember-rdfa-editor/utils/transaction-utils';

export type MandateeTableTag = string;
export type MandateeTableConfig<R> = Record<
  MandateeTableTag,
  MandateeTableConfigEntry<R>
>;
export type MandateeTableConfigEntry<R> = {
  query: () => Promise<R>;
  updateContent: (pos: number, queryResult: R) => TransactionMonad<boolean>;
};

export async function syncDocument<R>(
  state: EditorState,
  config: MandateeTableConfig<R>,
) {
  const { doc, schema } = state;

  const nodesToSync: { pos: number; tag: MandateeTableTag }[] = [];
  const queries: Promise<R>[] = [];
  doc.descendants((node, pos) => {
    if (node.type === schema.nodes.mandatee_table) {
      const tag = node.attrs.tag as MandateeTableTag;
      nodesToSync.push({ pos, tag });
      queries.push(config[node.attrs.tag as MandateeTableTag].query());
    }
  });
  const queryResults = await Promise.all(queries);
  const transactionMonads = [];
  for (let i = nodesToSync.length - 1; i >= 0; i--) {
    const { pos, tag } = nodesToSync[i];
    transactionMonads.push(config[tag].updateContent(pos, queryResults[i]));
  }
  const { transaction } = transactionCombinator(state)(transactionMonads);
  return state.applyTransaction(transaction).state;
}
