import { v4 as uuid } from 'uuid';

export default class InsertArticleCommand {
  name = 'insert-article';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, articleContent, articleNumber) {
    const limitedDatastore = controller.datastore.limitToRange(
      controller.selection.lastRange,
      'rangeIsInside'
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asSubjectNodes()
      .next().value;
    const besluitNode = [...besluit.nodes][0];
    let articleContainerNode;
    for (let child of besluitNode.children) {
      if (child.attributeMap.get('property') === 'prov:value') {
        articleContainerNode = child;
        break;
      }
    }
    const range = controller.rangeFactory.fromInNode(
      articleContainerNode,
      articleContainerNode.getMaxOffset(),
      articleContainerNode.getMaxOffset()
    );
    const articleUri = `http://data.lblod.info/artikels/${uuid()}`;
    const articleHtml = `
      <div property="eli:has_part" prefix="mobiliteit: https://data.vlaanderen.be/ns/mobiliteit#" typeof="besluit:Artikel" resource="${articleUri}">
        <div>
          Artikel
          <span property="eli:number" datatype="xsd:string">
            ${
              articleNumber
                ? articleNumber
                : this.generateArticleNumber(controller)
            }
          </span></div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div property="prov:value" datatype="xsd:string">
        ${
          articleContent
            ? articleContent
            : '<span class="mark-highlight-manual">Voer inhoud in</span>'
        }
        </div>
      </div>
    `;
    controller.executeCommand('insert-html', articleHtml, range);
    const newArticleElementSubjectNodes = controller.datastore
      .match(`>${articleUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    if (newArticleElementSubjectNodes) {
      const newArticleElement = [...newArticleElementSubjectNodes.nodes][0];
      console.log(newArticleElement.toXml());
      const range = controller.rangeFactory.fromInElement(
        newArticleElement,
        0,
        0
      );
      console.log('will select range');
      this.model.selectRange(range);
      this.model.writeSelection();
    }
  }

  generateArticleNumber(controller) {
    const numberQuads = [
      ...controller.datastore
        .match(null, '>http://data.europa.eu/eli/ontology#number', null)
        .asQuads(),
    ];
    let biggerNumber;
    for (let numberQuad of numberQuads) {
      const number = Number(this.removeZeroWidthSpace(numberQuad.object.value));
      if (!Number.isNaN(number) && (number > biggerNumber || !biggerNumber)) {
        biggerNumber = number;
      }
    }
    if (biggerNumber) {
      return biggerNumber + 1;
    } else {
      return '<span class="mark-highlight-manual">nummer</span>';
    }
  }

  removeZeroWidthSpace(text) {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  }
}
