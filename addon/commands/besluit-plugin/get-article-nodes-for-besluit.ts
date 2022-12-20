import { ProseController } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

export default function getArticleNodesForBesluit(
  controller: ProseController,
  besluitUri?: string
) {
  let besluitRange: { from: number; to: number } | undefined;
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
  const articles = controller.datastore
    .limitToRange(controller.state, besluitRange.from, besluitRange.to)
    .match(null, 'a', 'besluit:Artikel')
    .asSubjectNodeMapping();
  return [
    ...articles.map((article) => {
      return {
        uri: article.term.value,
        range: unwrap(article.nodes.shift()),
      };
    }),
  ];
}
