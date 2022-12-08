export default class MoveArticleCommand {
  name = 'move-article';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, besluitUri, articleElement, moveUp) {
    const subjectNodes = controller.datastore
      .match(`>${besluitUri}`, 'prov:value', null)
      .asSubjectNodes()
      .next().value;
    const besluitNode = [...subjectNodes.nodes][0];
    let articleContainerElement;
    for (let child of besluitNode.children) {
      if (child.getAttribute('property') === 'prov:value') {
        articleContainerElement = child;
      }
    }
    const articles = articleContainerElement.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    if (articles.length > 1) {
      const articleIndex = articles.findIndex(
        (article) => article === articleElement
      );
      if (moveUp && articleIndex <= 0) return;
      if (!moveUp && articleIndex >= articles.length - 1) return;
      const articleA = articles[articleIndex];
      const bIndex = moveUp ? articleIndex - 1 : articleIndex + 1;
      const articleB = articles[bIndex];

      const articleARange = controller.rangeFactory.fromAroundNode(articleA);
      const articleBRange = controller.rangeFactory.fromAroundNode(articleB);
      const articleAToInsert = articleA.clone();
      const articleBToInsert = articleB.clone();
      this.model.change((mutator) => {
        mutator.insertNodes(articleBRange, articleAToInsert);
        mutator.insertNodes(articleARange, articleBToInsert);
      });
      controller.executeCommand(
        'recalculate-article-numbers',
        controller,
        besluitUri
      );
      this.model.change(() => {
        const range = controller.rangeFactory.fromInElement(
          articleAToInsert,
          0,
          0
        );
        this.model.selectRange(range);
      });
    }
  }
}
