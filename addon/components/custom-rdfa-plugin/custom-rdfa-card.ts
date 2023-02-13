import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { PNode, ResolvedPos } from '@lblod/ember-rdfa-editor';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';

export function findAncestors(
  pos: ResolvedPos,
  predicate: (node: PNode) => boolean = () => true
) {
  const result: { node: PNode; pos: number }[] = [];
  let depth = pos.depth;
  while (depth >= 0) {
    const parent = pos.node(depth);
    if (predicate(parent)) {
      result.push({ node: parent, pos: pos.before(depth) });
    }
    depth -= 1;
  }
  return result;
}
type Args = {
  controller: ProseController;
};
export default class CustomRdfaCard extends Component<Args> {
  @tracked showCard = false;
  @tracked typeof?: string;
  @tracked property?: string;
  @tracked resource?: string;
  @tracked node?: {
    node: PNode;
    pos: number;
  };

  get controller() {
    return this.args.controller;
  }

  get state() {
    return this.controller.getState(true);
  }

  @action
  selectionChanged() {
    const { selection } = this.controller.getState(true);
    let rdfaNode;
    if (
      selection.$from.parent.type ===
      this.controller.schema.nodes['custom_rdfa']
    ) {
      rdfaNode = {
        node: selection.$from.parent,
        pos: selection.from,
      };
    } else {
      rdfaNode = findParentNodeOfType(
        this.controller.schema.nodes['custom_rdfa']
      )(selection);
    }
    if (rdfaNode) {
      this.showCard = true;
      this.typeof = rdfaNode.node.attrs.typeof as string;
      this.property = rdfaNode.node.attrs.property as string;
      this.resource = rdfaNode.node.attrs.resource as string;
      this.node = rdfaNode;
    } else {
      this.showCard = false;
      this.typeof = undefined;
      this.property = undefined;
      this.resource = undefined;
    }
  }

  @action
  changeValue(variable: string, event: InputEvent) {
    const element = event.target as HTMLInputElement;
    const value = element.value;
    switch (variable) {
      case 'typeof':
        this.typeof = value;
        break;
      case 'property':
        this.property = value;
        break;
      case 'resource':
        this.resource = value;
        break;
    }
  }

  @action
  insert() {
    if (!this.node) {
      return;
    }
    const transaction = this.controller
      .getState(true)
      .tr.setNodeMarkup(this.node?.pos, undefined, {
        typeof: this.typeof,
        property: this.property,
        resource: this.resource,
      });
    this.controller.getView(true).dispatch(transaction);
  }
}
