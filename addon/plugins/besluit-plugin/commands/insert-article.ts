import { v4 as uuid } from 'uuid';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import { ProseController, TextSelection } from '@lblod/ember-rdfa-editor';
import { Command } from '@lblod/ember-rdfa-editor';
import recalculateArticleNumbers from './recalculate-article-numbers';

export default function insertArticle(
  controller: ProseController,
  articleContent: string
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
        .asPredicateNodeMapping(),
    ][0].nodes[0];

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
            <span class="mark-highlight-manual">nummer</span>
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
      recalculateArticleNumbers(controller, besluitSubject.value);
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
