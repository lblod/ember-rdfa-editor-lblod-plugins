import { ProseController } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/plugins/datastore';

export default function getArticleNodesForBesluit(
  controller: ProseController,
  besluitUri?: string
) {
  let besluitNode: ResolvedPNode | undefined;
  if (besluitUri) {
    besluitNode = [
      ...controller.datastore
        .match(`>${besluitUri}`)
        .asSubjectNodeMapping()
        .nodes(),
    ][0];
  } else {
    const selection = controller.state.selection;
    besluitNode = [
      ...controller.datastore
        .limitToRange(controller.state, selection.from, selection.to)
        .match(null, 'a', 'besluit:Besluit')
        .asSubjectNodeMapping()
        .nodes(),
    ][0];
  }
  if (!besluitNode) {
    return;
  }
  const besluitRange = {
    from: besluitNode.pos,
    to: besluitNode.pos + besluitNode.node.nodeSize,
  };
  return [
    ...controller.datastore
      .limitToRange(controller.state, besluitRange.from, besluitRange.to)
      .match(null, 'a', 'besluit:Artikel')
      .asSubjectNodeMapping()
      .nodes(),
  ];
}
