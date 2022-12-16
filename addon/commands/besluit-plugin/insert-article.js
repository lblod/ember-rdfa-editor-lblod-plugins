import { v4 as uuid } from 'uuid';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

export default function InsertArticleCommand(
  controller,
  articleContent,
  articleNumber
) {
  return function (state, dispatch) {
    const selection = controller.state.selection;
    const limitedDatastore = controller.datastore.limitToRange(
      controller.state,
      selection.from,
      selection.to
    );
    const besluitSubject = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asQuadResultSet()
      .first().subject;

    const containerNode = [
      ...controller.datastore
        .match(besluitSubject, 'prov:value')
        .asPredicateNodeMapping()
        .nodes(),
    ][0];

    if (!containerNode) {
      return false;
    }
    if (dispatch) {
      let range = {
        from: containerNode.pos + containerNode.node.nodeSize - 1,
        to: containerNode.pos + containerNode.node.nodeSize - 1,
      };
      const articleUri = `http://data.lblod.info/artikels/${uuid()}`;
      const articleHtml = `
      <div property="eli:has_part" prefix="mobiliteit: https://data.vlaanderen.be/ns/mobiliteit#" typeof="besluit:Artikel" resource="${articleUri}">
        <div>
          Artikel
          <span property="eli:number" datatype="xsd:string">
            ${articleNumber ? articleNumber : generateArticleNumber(controller)}
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
      dispatch(
        controller.doCommand(insertHtml(articleHtml, range.from, range.to))
      );
    }

    return true;
  };
}

function generateArticleNumber(controller) {
  const numberQuads = [
    ...controller.datastore
      .match(null, '>http://data.europa.eu/eli/ontology#number', null)
      .asQuads(),
  ];
  let biggerNumber;
  for (let numberQuad of numberQuads) {
    const number = Number(removeZeroWidthSpace(numberQuad.object.value));
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

function removeZeroWidthSpace(text) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
}
