import {
  EditorState,
  PNode,
  ProsePlugin,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { changedDescendants } from '@lblod/ember-rdfa-editor/utils/_private/changed-descendants';
import {undoDepth} from '@lblod/ember-rdfa-editor/plugins/history'

type AutofilledArgs = {
  autofilledValues: {
    [Key: string]: string
  }
}

export function variableAutofillerPlugin(config: AutofilledArgs): ProsePlugin {
  return new ProsePlugin({
    appendTransaction(
      transactions: readonly Transaction[],
      oldState: EditorState,
      newState: EditorState,
    ) {
      const autofilledVariables: { node: PNode; pos: number }[] = [];
      if (undoDepth(oldState)) {
        changedDescendants(
          oldState.doc,
          newState.doc,
          0,
          (node: PNode, pos: number) => {
            if (
              node.type.name === 'autofilled_variable'
            ) {
              autofilledVariables.push({ node, pos });
              return false;
            }
            return true;
          },
        );
      } else {
        newState.doc.descendants((node: PNode, pos: number) => {
          if (
            node.type.name === 'autofilled_variable'
          ) {
            autofilledVariables.push({ node, pos });
            return false;
          }
          return true;
        })
      }
      if (autofilledVariables.length) {
        const tr = newState.tr;
        autofilledVariables.reverse()
        for (const { node, pos } of autofilledVariables) {
          autofillVariable(node, pos, config.autofilledValues, tr, newState.schema)
        }
        return tr;
      }
      return newState.tr;;
    },
  });
}

function autofillVariable(node: PNode, pos: number, values: {[Key: string]: string}, tr: Transaction, schema: Schema) {
  const autofillKey = node.attrs.autofillKey;
    const value = values[autofillKey]
    if(value) {
      const nodeSize = node.nodeSize;
      const valueNode = schema.text(value);
      if(node.attrs.convertToString === true || node.attrs.convertToString === "true" ) {
          tr.replaceRangeWith(pos, pos+nodeSize , valueNode)
          return;
      } else {
        tr.replaceRangeWith(pos + 1, pos+nodeSize - 1, valueNode)
      }
    }
}
