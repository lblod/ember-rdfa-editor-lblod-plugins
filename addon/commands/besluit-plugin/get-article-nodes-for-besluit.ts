import { ProseController } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

export default function getArticleNodesForBesluit(
  controller: ProseController,
  besluitUri?: string
) {
  let besluitRange: { from: number; to: number } | undefined;
  if (!besluitUri) {
    const selection = controller.state.selection;
    besluitUri = controller.datastore
      .limitToRange(controller.state, selection.from, selection.to)
      .match(null, 'a', 'besluit:Besluit')
      .asQuadResultSet()
      .first()?.subject.value;
  }
  if (!besluitUri) {
    return;
  }
  console.log('RANGE: ', besluitRange);
  const articles = controller.datastore
    .match(`>${besluitUri}`, 'eli:has_part')
    .asObjectNodeMapping();
  return [
    ...articles.map((article) => {
      return {
        uri: article.term.value,
        range: unwrap(article.nodes.shift()),
      };
    }),
  ];
}
