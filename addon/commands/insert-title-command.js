export default class InsertTitleCommand {
  name = 'insert-title';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, title) {
    const limitedDatastore = controller.datastore.limitToRange(
      controller.selection.lastRange,
      'rangeIsInside'
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asSubjectNodeMapping()
      .single();
    const besluitNode = besluit.nodes[0];
    const range = controller.rangeFactory.fromInNode(besluitNode, 0, 0);

    const articleHtml = `
      <h4 class="h4" property="eli:title" datatype="xsd:string">${
        title
          ? title
          : '<span class="mark-highlight-manual">Geef titel besluit op</span>'
      }</h4>
    `;
    controller.executeCommand('insert-html', articleHtml, range);
    controller.selection.selectRange(
      controller.selection.lastRange.shrinkToVisible()
    );
    //TODO: this is a hack, see https://binnenland.atlassian.net/browse/GN-3302
    const containedNodes =
      controller.selection.lastRange.contextNodes('rangeContains');
    // the second node is the span, this depends on the exact html inserted above
    containedNodes.next();
    const span = containedNodes.next().value;
    const finalRange = controller.rangeFactory.fromInNode(span);
    this.model.selectRange(finalRange);

    this.model.writeSelection();
  }
}
