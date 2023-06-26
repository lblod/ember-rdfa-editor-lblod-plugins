import { action } from '@ember/object';
import Component from '@glimmer/component';
import { PNode } from '@lblod/ember-rdfa-editor';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Selection } from '@lblod/ember-rdfa-editor';
import { NodeWithPos } from '@curvenote/prosemirror-utils';
import { TableOfContentsConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin';
type OutlineEntry = {
  content: string;
  pos: number;
  children?: OutlineEntry[];
};
export default class TableOfContentsComponent extends Component<EmberNodeArgs> {
  get config() {
    return this.args.node.attrs['config'] as TableOfContentsConfig;
  }

  get controller() {
    return this.args.controller;
  }

  get outline() {
    const entries = this.extractOutline({
      node: this.controller.mainEditorState.doc,
      pos: -1,
    });

    return {
      entries,
    };
  }

  extractOutline({ node, pos }: { node: PNode; pos: number }): OutlineEntry[] {
    let result: OutlineEntry[] = [];
    let parent: OutlineEntry | undefined;
    for (const option of this.config) {
      const { nodeHierarchy } = option;
      if (RegExp(`^${nodeHierarchy[0]}$`).exec(node.type.name)) {
        let i = 1;
        let currentNode: NodeWithPos | undefined = { node, pos };
        while (currentNode && i < nodeHierarchy.length) {
          let newCurrentNode: NodeWithPos | undefined;
          currentNode.node.forEach((child, offset) => {
            if (RegExp(`^${nodeHierarchy[i]}$`).exec(child.type.name)) {
              newCurrentNode = { pos: pos + offset, node: child };
              return;
            }
          });
          currentNode = newCurrentNode;
          i++;
        }
        if (currentNode) {
          const outlineText = currentNode.node.type.spec.outlineText as
            | ((node: PNode) => string)
            | undefined;
          const content =
            outlineText?.(currentNode.node) ?? currentNode.node.textContent;
          parent = {
            pos: currentNode.pos,
            content,
          };
        }
      }
    }
    const subResults: OutlineEntry[] = [];
    node.forEach((child, offset) => {
      subResults.push(
        ...this.extractOutline({ node: child, pos: pos + 1 + offset })
      );
    });
    if (parent) {
      parent.children = subResults;
      result = [parent];
    } else {
      result = subResults;
    }
    return result;
  }

  @action
  moveToPosition(pos: number) {
    this.controller.withTransaction((tr) => {
      const resolvedPos = tr.doc.resolve(pos);
      const selection = Selection.near(resolvedPos, 1);
      if (selection) {
        tr.setSelection(selection);
        const coords = this.controller.mainEditorView.coordsAtPos(
          selection.from
        );
        const config = this.config[0];
        if (config.scrollContainer) {
          const scrollContainer: HTMLElement = config.scrollContainer();
          const alreadyScrolled = scrollContainer.scrollTop;
          scrollContainer.scrollTo(
            0,
            coords.top +
              alreadyScrolled -
              (scrollContainer.getBoundingClientRect().y + 10)
          );
        } else {
          tr.scrollIntoView();
        }
      }
      return tr;
    });
    this.controller.focus();
  }
}
