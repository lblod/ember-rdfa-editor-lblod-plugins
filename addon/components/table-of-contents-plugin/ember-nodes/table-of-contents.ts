import { action } from '@ember/object';
import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Selection } from '@lblod/ember-rdfa-editor';
import { TableOfContentsConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin';
import { extractOutline } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/utils';
export default class TableOfContentsComponent extends Component<EmberNodeArgs> {
  get config() {
    return this.args.node.attrs['config'] as TableOfContentsConfig;
  }

  get controller() {
    return this.args.controller;
  }

  get outline() {
    const entries = extractOutline({
      node: this.controller.mainEditorState.doc,
      pos: -1,
      config: this.config,
    });

    return {
      entries,
    };
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
