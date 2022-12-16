import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

export default function recalculateArticleNumbers(controller) {
  const articles = controller.datastore
    .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
    .asPredicateNodes()
    .next().value;
  if (articles) {
    const articlesArray = [...articles.nodes];
    for (let i = 0; i < articlesArray.length; i++) {
      const article = articlesArray[i];
      replaceNumberIfNeeded(controller, article, i);
    }
  }
}

function replaceNumberIfNeeded(controller, article, index) {
  const articleNumberObjectNode = controller.datastore
    .match(
      `>${article?.node?.attrs['resource']}`,
      '>http://data.europa.eu/eli/ontology#number',
      null
    )
    .asObjectNodes()
    .next().value;
  const articleNumber = Number(articleNumberObjectNode.object.value);
  const articleNumberElement = [...articleNumberObjectNode.nodes][0];
  const articleNumberExpected = index + 1;

  if (articleNumber !== articleNumberExpected) {
    controller.doCommand(
      insertHtml(
        articleNumberExpected + '',
        articleNumberElement.pos + 1,
        articleNumberElement.pos + articleNumberElement.node.nodeSize
      )
    );
  }
}
