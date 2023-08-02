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
        ...this.extractOutline({ node: child, pos: pos + 1 + offset }),
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
          selection.from,
        );
        const config = this.config[0];
        let scrollContainer: HTMLElement | undefined;
        if (config.scrollContainer) {
          scrollContainer = config.scrollContainer();
        } else {
          scrollContainer = this.getScrollContainer();
        }
        if (scrollContainer) {
          /*
            coords.top = The distance from the top of the page to your element, this changes with the amount you
            have scrolled so far
            scrollContainerDistanceToTop = absolute y-coord of the start of the scroll container.
            The difference between these two plus the alreadyScrolled distance is where we want to scroll
          */
          const alreadyScrolled = scrollContainer.scrollTop;
          const scrollContainerDistanceToTop =
            scrollContainer.getBoundingClientRect().y;
          const topPadding = 10; // We need top padding so the wanted position is not just on top of the page
          scrollContainer.scrollTo(
            0,
            coords.top +
              alreadyScrolled -
              (scrollContainerDistanceToTop + topPadding),
          );
        } else {
          tr.scrollIntoView();
        }
      }
      return tr;
    });
    this.controller.focus();
  }
  getScrollContainer(): HTMLElement | undefined {
    let currentElement = this.controller.mainEditorView.dom;
    while (currentElement.parentElement) {
      const parent = currentElement.parentElement;
      if (this.isScrollable(parent)) {
        return parent;
      }
      currentElement = parent;
    }
    return;
  }
  isScrollable(element: HTMLElement): boolean {
    const hasScrollableContent = element.scrollHeight > element.clientHeight;
    const overflowYStyle = window.getComputedStyle(element).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

    return hasScrollableContent && !isOverflowHidden;
  }
}
