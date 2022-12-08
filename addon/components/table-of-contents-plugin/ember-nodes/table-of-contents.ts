import { action } from '@ember/object';
import Component from '@glimmer/component';
import { TableOfContentsConfig } from '../../../constants';
import { Node as PNode } from 'prosemirror-model';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
type OutlineEntry = {
  content: string;
  children?: OutlineEntry[];
};
export default class TableOfContentsComponent extends Component<EmberNodeArgs> {
  get config() {
    console.log('GET CONFIG');
    return this.args.node.attrs['config'] as TableOfContentsConfig;
  }

  get outline() {
    const entries = this.extractOutline(this.args.controller.state.doc);
    return {
      entries,
    };
  }

  extractOutline(node: PNode): OutlineEntry[] {
    console.log('EXTRACT OUTLINE');
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
          console.log('MATCH');
          if (typeof tocConfigEntry.value === 'string') {
            parent = { content: tocConfigEntry.value };
            break;
          } else {
            console.log('RESOURCE: ', attributes['resource']);
            console.log('PREDICATE: ', tocConfigEntry.value.predicate);
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
            console.log('NODES: ', nodes);
            if (resolvedNode) {
              parent = {
                content: resolvedNode.node.textContent,
              };
              break;
            }
          }
        }
      }
    }
    const subResults: OutlineEntry[] = [];
    node.content.forEach((child) => {
      subResults.push(...this.extractOutline(child));
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
  moveToSection() {
    console.warn('Move to section is currently not implemented');
    // const range = this.args.editorController.rangeFactory.fromInNode(node, 0);
    // this.args.editorController.selection.selectRange(range);
    // this.args.editorController.write(true, true);
  }
}
