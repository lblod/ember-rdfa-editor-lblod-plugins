import { ProseController } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/plugins/datastore';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import getArticleNodesForBesluit from './get-article-nodes-for-besluit';

export default function recalculateArticleNumbers(
  controller: ProseController,
  besluitUri: string
) {
  const articles = getArticleNodesForBesluit(controller, besluitUri);
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
  const articleURI = controller.state.doc.nodeAt(article.from)?.attrs[
    'resource'
  ] as string | undefined;
  if (!articleURI) {
    throw new Error(
      `Article URI not found for range { from: ${article.from}, to: ${article.to} }`
    );
  }
  const articleNumberObject = [
    ...controller.datastore
      .match(`>${articleURI}`, '>http://data.europa.eu/eli/ontology#number')
      .asObjectNodeMapping(),
  ][0];
  if (!articleNumberObject) {
    return;
  }
  const articleNumber = Number(articleNumberObject.term.value);
  const articleNumberRange = unwrap(articleNumberObject.nodes[0]);
  const articleNumberExpected = index + 1;

  if (articleNumber !== articleNumberExpected) {
    controller.withTransaction((tr) => {
      return tr.insertText(
        articleNumberExpected.toString(),
        articleNumberRange.from + 1,
        articleNumberRange.to - 1
      );
    });
  }
}
