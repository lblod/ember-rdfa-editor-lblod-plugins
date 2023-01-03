import { action } from '@ember/object';
import Component from '@glimmer/component';
import { PNode } from '@lblod/ember-rdfa-editor';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Selection } from '@lblod/ember-rdfa-editor';
import { getRdfaAttribute } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { TableOfContentsConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/utils/constants';
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
      node: this.controller.state.doc,
      pos: -1,
    });
    return {
      entries,
    };
  }

  extractOutline({ node, pos }: { node: PNode; pos: number }): OutlineEntry[] {
    let result: OutlineEntry[] = [];
    let parent: OutlineEntry | undefined;
    const properties = getRdfaAttribute(node, 'property').pop();
    const resource = getRdfaAttribute(node, 'resource').pop();
    if (properties && resource) {
      for (const tocConfigEntry of this.config) {
        if (
          tocConfigEntry.sectionPredicate.some((pred) =>
            properties.includes(pred)
          )
        ) {
          if (typeof tocConfigEntry.value === 'string') {
            parent = { content: tocConfigEntry.value, pos };
            break;
          } else {
            const range = [
              ...this.args.controller.datastore
                .match(`>${resource}`, `>${tocConfigEntry.value.predicate}`)
                .asPredicateNodeMapping()
                .nodes(),
            ][0];
            if (range) {
              const node = unwrap(this.controller.state.doc.nodeAt(range.from));
              parent = {
                content: node.textContent,
                pos: range.from,
              };
              break;
            }
          }
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
        tr.scrollIntoView();
      }
      return tr;
    });
    this.controller.focus();
  }
}
