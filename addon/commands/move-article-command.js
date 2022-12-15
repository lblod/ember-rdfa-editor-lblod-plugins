import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import { InsertArticleCommand } from '@lblod/ember-rdfa-editor-lblod-plugins/commands/insert-article-command';

export function moveArticleCommand(
  controller,
  besluitUri,
  articleElement,
  moveUp
) {
  const subjectNodes = controller.datastore
    .match(`>${besluitUri}`, 'prov:value', null)
    .asSubjectNodes()
    .next().value;
  const besluitNode = [...subjectNodes.nodes][0];
  console.log('sbx9 -> besluitNode', besluitNode);
  console.log('sbx9 -> subjectNodes', subjectNodes);
  let articleContainerElement;
  for (let child of besluitNode?.node?.content?.content) {
    console.log('child', child);
    if (child.attrs['property']?.includes('prov:value')) {
      articleContainerElement = child;
    }
  }
  console.log('sbx9 articleContainerElement', articleContainerElement);
  console.log('sbx9 articleElement', articleElement);
  const articles = [
    ...controller.datastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
      .asPredicateNodeMapping()
      .nodes(),
  ];
  console.log('sbx9 articles', articles);
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
    console.log('sbx9 articleA', articleA);
    console.log('sbx9 cleB', articleB);
    // const articleAToInsert = articleA.clone();
    // const articleBToInsert = articleB.clone();
    // controller.withTransaction((tr) => {
    //   tr.replaceSelectionWith(articleA, true);
    // });
    // controller.doCommand(
    //   insertHtml(
    //     articleA,
    //     articleA?.pos.pos,
    //     articleA.pos.pos + articleA.node.nodeSize
    //   )
    // );
    // controller.doCommand(
    //   insertHtml(
    //     articleB,
    //     articleA?.pos.pos,
    //     articleA.pos.pos + articleA.node.nodeSize
    //   )
    // );

    // const articleARange = controller.rangeFactory.fromAroundNode(articleA);
    // const articleBRange = controller.rangeFactory.fromAroundNode(articleB);
    // const articleAToInsert = articleA.clone();
    // const articleBToInsert = articleB.clone();
    // this.model.change((mutator) => {
    //   mutator.insertNodes(articleBRange, articleAToInsert);
    //   mutator.insertNodes(articleARange, articleBToInsert);
    // });
    // controller.executeCommand(
    //   'recalculate-article-numbers',
    //   controller,
    //   besluitUri
    // );
    // this.model.change(() => {
    //   const range = controller.rangeFactory.fromInElement(
    //     articleAToInsert,
    //     0,
    //     0
    //   );
    //   this.model.selectRange(range);
    // });
  }
}
