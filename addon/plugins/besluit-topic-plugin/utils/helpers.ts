import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { ElementPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';

export const getCurrentBesluitRange = (
  controller: SayController,
): ElementPNode | undefined => {
  const selection = controller.mainEditorState.selection;

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

export const getCurrentBesluitURI = (controller: SayController) => {
  const currentBesluitRange = getCurrentBesluitRange(controller);
  const doc = controller.mainEditorState.doc;

  if (currentBesluitRange) {
    const node = unwrap(doc.nodeAt(currentBesluitRange.from));
    return node.attrs['subject'] as string | undefined;
  }

  return;
};
