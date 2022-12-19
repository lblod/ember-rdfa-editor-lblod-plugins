import { v4 as uuid } from 'uuid';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import { ProseController, TextSelection } from '@lblod/ember-rdfa-editor';
import { Command } from '@lblod/ember-rdfa-editor';

export default function insertArticle(
  controller: ProseController,
  articleContent: string,
  articleNumber: string
): Command {
  return function (_state, dispatch) {
    const selection = controller.state.selection;
    const limitedDatastore = controller.datastore.limitToRange(
      controller.state,
      selection.from,
      selection.to
    );
    const besluitSubject = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asQuadResultSet()
      .first()?.subject;

    if (!besluitSubject) {
      return false;
    }

    const containerRange = [
      ...controller.datastore
        .match(besluitSubject, 'prov:value')
        .asPredicateNodeMapping()
        .nodes(),
    ][0];

    if (!containerRange) {
      return false;
    }
    if (dispatch) {
      const range = {
        from: containerRange.to - 1,
        to: containerRange.to - 1,
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
      controller.doCommand(insertHtml(articleHtml, range.from, range.to));

      controller.withTransaction((tr) => {
        const selection = TextSelection.near(
          controller.state.doc.resolve(range.from)
        );
        return tr.setSelection(selection).scrollIntoView();
      });
      controller.focus();
    }
    return true;
  };
}

function generateArticleNumber(controller: ProseController) {
  const numberQuads = [
    ...controller.datastore
      .match(null, '>http://data.europa.eu/eli/ontology#number')
      .asQuads(),
  ];
  let biggerNumber;
  for (const numberQuad of numberQuads) {
    const number = Number(removeZeroWidthSpace(numberQuad.object.value));
    if (!Number.isNaN(number) && (!biggerNumber || number > biggerNumber)) {
      biggerNumber = number;
    }
  }
  if (biggerNumber) {
    return biggerNumber + 1;
  } else {
    return '<span class="mark-highlight-manual">nummer</span>';
  }
}

function removeZeroWidthSpace(text: string) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
}
