import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TableOfContentsConfig } from '../../../constants';
import { Node as PNode } from 'prosemirror-model';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Selection } from 'prosemirror-state';
type OutlineEntry = {
  content: string;
  pos: number;
  children?: OutlineEntry[];
};
export default class TableOfContentsComponent extends Component<EmberNodeArgs> {
  get config() {
    return this.args.node.attrs['config'] as TableOfContentsConfig;
  }

  get outline() {
    const entries = this.extractOutline({
      node: this.args.controller.state.doc,
      pos: -1,
    });
    return {
      entries,
    };
  }

  extractOutline({ node, pos }: { node: PNode; pos: number }): OutlineEntry[] {
    let result: OutlineEntry[] = [];
    let parent: OutlineEntry | undefined;
    const attributes = node.attrs;
    const properties = node.attrs['property'] as string | undefined;
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
            const nodes = [
              ...this.args.controller.datastore
                .match(
                  `>${attributes['resource'] as string}`,
                  `>${tocConfigEntry.value.predicate}`
                )
                .asObjectNodeMapping()
                .nodes(),
            ];
            const resolvedNode = nodes[0];
            if (resolvedNode) {
              parent = {
                content: resolvedNode.node.textContent,
                pos: resolvedNode.pos?.pos ?? -1,
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
    this.args.controller.withTransaction((tr) => {
      const resolvedPos = this.args.controller.state.doc.resolve(pos);
      const selection = Selection.near(resolvedPos, 1);
      if (selection) {
        tr.setSelection(selection);
        tr.scrollIntoView();
      }
      return tr;
    });
  }
}
