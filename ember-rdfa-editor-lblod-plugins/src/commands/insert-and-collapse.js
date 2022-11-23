export default class InsertAndCollapseCommand {
  name = 'insert-and-collapse';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, htmlString, node) {
    const range = controller.rangeFactory.fromInNode(
      node,
      0,
      node.getMaxOffset()
    );
    controller.executeCommand('insert-html', htmlString, range);

    controller.selection.selectRange(
      controller.selection.lastRange.shrinkToVisible()
    );
    const containedNodes =
      controller.selection.lastRange.contextNodes('rangeContains');
    containedNodes.next();
    const span = containedNodes.next().value;
    const finalRange = controller.rangeFactory.fromInNode(span);
    controller.selection.selectRange(finalRange);

    this.model.writeSelection();
  }
}
