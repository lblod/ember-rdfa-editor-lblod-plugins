import { EditorState, PNode, SayController } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { ElementPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';

export const getCurrentBesluitRange = (
  controllerOrState: SayController | EditorState,
): ElementPNode | undefined => {
  const state =
    controllerOrState instanceof SayController
      ? controllerOrState.mainEditorState
      : controllerOrState;
  const selection = state.selection;

  const besluit =
    findAncestors(selection.$from, (node: PNode) => {
      return hasOutgoingNamedNodeTriple(
        node.attrs,
        RDF('type'),
        BESLUIT('Besluit'),
      );
    })[0] ?? null;
  if (!besluit) {
    return undefined;
  }

  return {
    node: besluit.node,
    from: besluit.pos,
    to: besluit.pos + besluit.node.nodeSize,
  };
};

export const getCurrentBesluitURI = (
  controllerOrState: SayController | EditorState,
) => {
  const currentBesluitRange = getCurrentBesluitRange(controllerOrState);

  if (currentBesluitRange) {
    return currentBesluitRange.node.attrs['subject'] as string | undefined;
  }

  return;
};
