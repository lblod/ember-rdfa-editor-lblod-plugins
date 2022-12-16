import recalculateArticleNumbers from '@lblod/ember-rdfa-editor-lblod-plugins/commands/recalculate-article-numbers-command';

export default function moveArticleCommand(
  controller,
  besluitUri,
  articleElement,
  moveUp
) {
  const articles = [
    ...controller.datastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
      .asPredicateNodeMapping()
      .nodes(),
  ];
  if (articles.length > 1) {
    const articleIndex = articles.findIndex(
      (article) => article === articleElement
    );
    if (moveUp && articleIndex <= 0) return;
    if (!moveUp && articleIndex >= articles.length - 1) return;
    let articleA;
    let articleB;
    if (moveUp) {
      articleA = articles[articleIndex];
      articleB = articles[articleIndex + 1];
    } else {
      articleA = articles[articleIndex - 1];
      articleB = articles[articleIndex];
    }
    const articleBRange = {
      from: articleB.pos,
      to: articleB.pos + articleB.node.nodeSize,
    };
    controller.withTransaction((tr) => {
      tr.delete(articleBRange.from, articleBRange.to);
      return tr.replaceRangeWith(articleA.pos, articleA.pos, articleB.node);
    });
    recalculateArticleNumbers(controller);
  }
}
