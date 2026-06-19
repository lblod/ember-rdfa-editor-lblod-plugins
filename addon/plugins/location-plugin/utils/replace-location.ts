import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { Address } from './address-helpers';
import { Area, Place } from './geo-helpers';
import {
  EditorState,
  Transaction,
  NodeSelection,
  TextSelection,
  PNode,
  Selection,
  Command,
} from '@lblod/ember-rdfa-editor';
import type { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { PROV } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { transactionCombinator } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { updateSubject } from '@lblod/ember-rdfa-editor/plugins/rdfa-info/utils';

function moveNodeSelectionForward(selection: Selection, doc: PNode) {
  if (!(selection instanceof NodeSelection)) {
    return selection;
  }

  const $from = selection.$from;

  const index = $from.index();
  const parent = $from.parent;

  if (index + 1 < parent.childCount) {
    const nextPos = selection.from + selection.node.nodeSize;

    return NodeSelection.create(doc, nextPos);
  } else {
    const posAfter = selection.to;

    return TextSelection.create(doc, posAfter);
  }
}

export function replaceLocationCommand(
  node: ResolvedPNode,
  location: Address | Place | Area,
): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    if (!dispatch) return false;

    const df = new SayDataFactory();
    const { pos, value: locNode } = node;
    // The location's subject has likely changed, so we should update the external links too
    // if they exist
    // NOTE: It's VERY important that this is done without mutating the triple objects
    // otherwise the attributes will not update as expected when undo-ing
    const newExternalTriples: FullTriple[] = (
      locNode.attrs.externalTriples as FullTriple[]
    ).map((tr) => {
      if (PROV('atLocation').matches(tr.predicate)) {
        return { ...tr, object: df.namedNode(location.uri) };
      } else {
        return tr;
      }
    }); // update the location value and the external triples
    const tr = state.tr;
    const setLocationTr = transactionCombinator(
      state,
      tr
        .setNodeAttribute(pos, 'value', location)
        .setNodeAttribute(pos, 'externalTriples', newExternalTriples),
    )([
      // Update the subject uri, while keeping backlinks intact
      updateSubject({
        pos,
        targetSubject: location.uri,
        keepBacklinks: true,
        keepProperties: false,
        keepExternalTriples: true,
      }),
    ]).transaction;

    const newSelection = moveNodeSelectionForward(
      state.selection.map(setLocationTr.doc, setLocationTr.mapping),
      setLocationTr.doc,
    );
    setLocationTr.setSelection(newSelection);
    dispatch(setLocationTr);
    return true;
  };
}
