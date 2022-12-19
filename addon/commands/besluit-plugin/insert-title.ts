import {
  Command,
  ProseController,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

export default function insertTitle(
  controller: ProseController,
  title: string
): Command {
  return function (state, dispatch) {
    const selection = controller.state.selection;
    const limitedDatastore = controller.datastore.limitToRange(
      controller.state,
      selection.from,
      selection.to
    );

    const besluit = [
      ...limitedDatastore
        .match(null, 'a', 'besluit:Besluit')
        .asSubjectNodeMapping(),
    ][0];

    const besluitRange = besluit.nodes[0];

    if (!besluit || !besluitRange) {
      return false;
    }

    const titleQuad = controller.datastore
      .match(
        `>${besluit.term.value}`,
        '>http://data.europa.eu/eli/ontology#title'
      )
      .asQuadResultSet()
      .first();
    if (titleQuad) {
      return false;
    }

    if (dispatch) {
      const range = {
        from: besluitRange.from + 1,
        to: besluitRange.from + 1,
      };
      const articleHtml = `
      <h4 class="h4" property="eli:title" datatype="xsd:string">${
        title
          ? title
          : '<span class="mark-highlight-manual">Geef titel besluit op</span>'
      }</h4>
    `;
      controller.doCommand(insertHtml(articleHtml, range.from, range.to));
      controller.withTransaction((tr) => {
        const selection = TextSelection.near(
          controller.state.doc.resolve(range.from)
        );
        return tr.setSelection(selection).scrollIntoView();
      });
      dispatch(state.tr.scrollIntoView());
    }

    return true;
  };
}
