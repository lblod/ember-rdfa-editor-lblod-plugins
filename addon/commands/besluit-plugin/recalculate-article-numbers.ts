import { ProseController } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/plugins/datastore';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

export default function recalculateArticleNumbers(controller: ProseController) {
  const articles = [
    ...controller.datastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
      .asPredicateNodeMapping()
      .nodes(),
  ];
  if (articles) {
    for (let i = 0; i < articles.length; i++) {
      const article = unwrap(articles[i]);
      replaceNumberIfNeeded(controller, article, i);
    }
  }
}

function replaceNumberIfNeeded(
  controller: ProseController,
  article: ResolvedPNode,
  index: number
) {
  const articleNumberObject = [
    ...controller.datastore
      .match(
        `>${article.node.attrs['resource'] as string}`,
        '>http://data.europa.eu/eli/ontology#number'
      )
      .asObjectNodeMapping(),
  ][0];
  if (!articleNumberObject) {
    return;
  }
  const articleNumber = Number(articleNumberObject.term.value);
  const articleNumberElement = unwrap(articleNumberObject.nodes[0]);
  const articleNumberExpected = index + 1;

  if (articleNumber !== articleNumberExpected) {
    controller.withTransaction((tr) => {
      return tr.insertText(
        articleNumberExpected.toString(),
        articleNumberElement.pos + 1,
        articleNumberElement.pos + articleNumberElement.node.nodeSize
      );
    });
  }
}
