import { SayController } from '@lblod/ember-rdfa-editor';
import { findAncestorOfType } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/utils/structure';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';

export const getCurrentBesluitRange = (
  controller: SayController,
): ResolvedPNode | undefined => {
  const selection = controller.mainEditorState.selection;
  const besluit = findAncestorOfType(
    selection,
    controller.schema.nodes['besluit'],
  );

  if (!besluit) {
    return undefined;
  }

  return {
    node: besluit.node,
    from: besluit.start - 1,
    to: besluit.start + besluit.node.nodeSize - 1,
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
