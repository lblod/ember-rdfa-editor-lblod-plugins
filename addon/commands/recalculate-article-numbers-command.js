import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

export function recalculateArticleNumbers(controller, besluitUri) {
  const { from, to } = controller.state.selection;

  const limitedDatastore = controller.datastore.limitToRange(
    controller.state,
    from,
    to
  );

  const besluitSubjectNodes = [
    ...limitedDatastore
      .match(`>${besluitUri}`, null, null)
      .asObjectNodeMapping()
      .nodes(),
  ];
  console.log('sbx8, besluit', besluitSubjectNodes);
  console.log('sbx8, besluitUri', besluitUri);
  // const besluit = [...besluitSubjectNodes.nodes][0];
  const articles = controller.datastore
    .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
    .asPredicateNodes()
    .next().value;
  console.log('sbx8 article s *!*@@*!@*!@!*', articles);
  if (articles) {
    const articlesArray = [...articles.nodes];
    for (let i = 0; i < articlesArray.length; i++) {
      const article = articlesArray[i];
      console.log('sbx8 !!!!!!! article', article);
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
  console.log('sbx8 articleNumberObjectNode', articleNumberObjectNode);
  const articleNumber = Number(articleNumberObjectNode.object.value);
  const articleNumberElement = [...articleNumberObjectNode.nodes][0];
  const articleNumberExpected = index + 1;
  console.log('articleNumberExpected', articleNumberExpected);
  console.log('articleNumber', articleNumber);
  console.log('articleNumberElement', articleNumberElement);
  if (articleNumber !== articleNumberExpected) {
    controller.doCommand(
      insertHtml(
        articleNumberExpected + '',
        articleNumberElement.pos.pos + 1,
        articleNumberElement.pos.pos + articleNumberElement.node.nodeSize
      )
    );
  }
  // if (articleNumber !== articleNumberExpected) {
  //   controller.executeCommand(
  //     'insert-text',
  //     String(articleNumberExpected),
  //     controller.rangeFactory.fromInNode(
  //       articleNumberElement,
  //       0,
  //       articleNumberElement.getMaxOffset()
  //     )
  //   );
  // }
}
