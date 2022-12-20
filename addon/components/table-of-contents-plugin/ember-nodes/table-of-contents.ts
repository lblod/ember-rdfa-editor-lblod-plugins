import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TableOfContentsConfig } from '../../../constants';
import { PNode } from '@lblod/ember-rdfa-editor';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Selection } from '@lblod/ember-rdfa-editor';
import { getRdfaAttributes } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
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
    const attributes = getRdfaAttributes(node);
    const properties = attributes?.property;
    if (properties) {
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
            const { from } = [
              ...this.args.controller.datastore
                .match(
                  `>${attributes['resource'] as string}`,
                  `>${tocConfigEntry.value.predicate}`
                )
                .asObjectNodeMapping()
                .nodes(),
            ][0];
            const node = this.controller.state.doc.nodeAt(from);
            if (node) {
              parent = {
                content: node.textContent,
                pos: from,
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
  }
}
