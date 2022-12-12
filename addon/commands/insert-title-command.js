import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';

export function InsertTitleCommand(controller, title) {
  let range = controller.state.selection;
  controller.state.doc.descendants((node, pos) => {
    const typeOfAttribute = node.attrs['typeof'];
    if (
      typeOfAttribute?.includes('besluit:Besluit') ||
      typeOfAttribute?.includes('http://data.vlaanderen.be/ns/besluit#Besluit')
    ) {
      range = { from: pos + 1, to: pos + 1 };
      return false;
    }
  });

  const articleHtml = `
      <h4 class="h4" property="eli:title" datatype="xsd:string">${
        title
          ? title
          : '<span class="mark-highlight-manual">Geef titel besluit op</span>'
      }</h4>
    `;
  controller.doCommand(insertHtml(articleHtml, range.from, range.to));
}
