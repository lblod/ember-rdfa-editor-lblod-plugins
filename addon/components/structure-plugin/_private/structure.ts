import { SayController, Schema } from '@lblod/ember-rdfa-editor';
import { PNode } from '@lblod/ember-rdfa-editor';
import Component from '@glimmer/component';
import { Args } from 'ember-modifier/-private/class/modifier';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import ProseMirrorEditor from '../../prosemirror-editor';
import { text } from '@lblod/ember-rdfa-editor/nodes';
import { action } from '@ember/object';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

export default class Structure extends Component<EmberNodeArgs> {
  ProseMirrorEditor = ProseMirrorEditor;

  titleSchema = new Schema({
    nodes: {
      text: {},
      doc: {
        content: 'text*',
        toDOM: () => {
          return ['span', 0];
        },
      },
    },
  });

  get showPlaceholder() {
    return this.args.node.nodeSize === 0;
  }

  get node() {
    return this.args.node;
  }

  get isEmpty() {
    if (this.node.childCount > 1) {
      return false;
    }
    const firstChild = unwrap(this.node.firstChild);
    console.log(firstChild);
    if (!firstChild.isTextblock) {
      return false;
    }
    if (firstChild.childCount > 0) {
      return false;
    }
    console.log('Is empty');
    return true;
  }

  get tag() {
    return 'div';
  }

  get titleContent() {
    const title = (this.node.attrs.title ?? '') as string;
    return title;
  }

  @action
  onTitleUpdate(content: string) {
    console.log('Update: ', content);
    const pos = this.args.getPos();
    if (pos !== undefined) {
      console.log('Update node attrs');
      this.args.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'title', content);
      });
    }
  }
}
