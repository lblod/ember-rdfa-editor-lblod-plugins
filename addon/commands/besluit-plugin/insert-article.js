import { v4 as uuid } from 'uuid';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

export default function InsertArticleCommand(
  controller,
  articleContent,
  articleNumber
) {
  let range = controller.state.selection;
  controller.state.doc.descendants((node, pos) => {
    const typeOfAttribute = node.attrs['typeof'];
    if (
      typeOfAttribute?.includes('besluit:Besluit') ||
      typeOfAttribute?.includes('http://data.vlaanderen.be/ns/besluit#Besluit')
    ) {
      range = { from: pos + node.nodeSize - 2, to: pos + node.nodeSize - 2 };
      return false;
    }
  });
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
  controller.doCommand(insertHtml(articleHtml, range.from, range.to));
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
