import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

export default function InsertTitleCommand(controller, title) {
  return function (state, dispatch) {
    const selection = this.controller.state.selection;
    const limitedDatastore = controller.datastore.limitToRange(
      this.args.controller.state,
      selection.from,
      selection.to
    );
    const besluitNode = [
      ...limitedDatastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
        .asSubjectNodeMapping()
        .nodes()[0],
    ];

    if (!besluitNode) {
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
      dispatch(
        controller.doCommand(
          insertHtml(articleHtml, besluitNode.pos + 1, besluitNode.pos + 1)
        )
      );
    }

    return true;
  };
}
