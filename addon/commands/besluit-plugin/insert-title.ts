import { Command, ProseController } from '@lblod/ember-rdfa-editor';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

export default function InsertTitleCommand(
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
    const besluitNode = [
      ...limitedDatastore
        .match(null, 'a', 'besluit:Besluit')
        .asSubjectNodeMapping()
        .nodes(),
    ][0];

    if (!besluitNode) {
      return false;
    }
    console.log('BESLUIT URI: ', besluitNode?.node.attrs['resource']);
    const titleQuad = controller.datastore
      .match(
        `>${besluitNode.node.attrs['resource'] as string}`,
        '>http://data.europa.eu/eli/ontology#title'
      )
      .asQuadResultSet()
      .first();
    console.log(titleQuad);
    if (titleQuad) {
      return false;
    }

    if (dispatch) {
      const articleHtml = `
      <h4 class="h4" property="eli:title" datatype="xsd:string">${
        title
          ? title
          : '<span class="mark-highlight-manual">Geef titel besluit op</span>'
      }</h4>
    `;
      controller.doCommand(
        insertHtml(articleHtml, besluitNode.pos + 1, besluitNode.pos + 1)
      );
    }

    return true;
  };
}
