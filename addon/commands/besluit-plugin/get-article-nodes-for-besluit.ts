import { ProseController } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/plugins/datastore';

export default function getArticleNodesForBesluit(
  controller: ProseController,
  besluitUri?: string
) {
  let besluitRange: ResolvedPNode | undefined;
  if (besluitUri) {
    besluitRange = [
      ...controller.datastore
        .match(`>${besluitUri}`)
        .asSubjectNodeMapping()
        .nodes(),
    ][0];
  } else {
    const selection = controller.state.selection;
    besluitRange = [
      ...controller.datastore
        .limitToRange(controller.state, selection.from, selection.to)
        .match(null, 'a', 'besluit:Besluit')
        .asSubjectNodeMapping()
        .nodes(),
    ][0];
  }
  if (!besluitRange) {
    return;
  }
  return [
    ...controller.datastore
      .limitToRange(controller.state, besluitRange.from, besluitRange.to)
      .match(null, 'a', 'besluit:Artikel')
      .asSubjectNodeMapping()
      .nodes(),
  ];
}
