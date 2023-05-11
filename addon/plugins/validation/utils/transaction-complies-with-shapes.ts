import { EditorState, Transaction } from '@lblod/ember-rdfa-editor';
import { validateTransaction } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation';

/**
 * Validate a given transaction against a given set of shapes. Returns true when the
 * state after applying the transaction is valid according to all given shapes,
 * false otherwise.
 * @param state the state the transaction was created from
 * @param tr
 * @param validateShapes
 */
export function transactionCompliesWithShapes(
  state: EditorState,
  tr: Transaction,
  validateShapes?: Set<string>
) {
  if (validateShapes?.size) {
    const report = validateTransaction(state, tr);
    if (
      report.results?.some((result) =>
        validateShapes.has(result.sourceShape.name)
      )
    ) {
      return false;
    }
  }
  return true;
}
