import { ProseParser, SayController, Schema } from '@lblod/ember-rdfa-editor';
import { PNode } from '@lblod/ember-rdfa-editor';
import Component from '@glimmer/component';
import { Args } from 'ember-modifier/-private/class/modifier';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import ProseMirrorEditor from '../../prosemirror-editor';
import { text } from '@lblod/ember-rdfa-editor/nodes';
import { action } from '@ember/object';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { tracked, cached} from '@glimmer/tracking';

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
  @tracked titleContent = this.titleAttr;

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
  get titleAttr() {
    return this.node.attrs.title;
  }

  @action
  onAttrsUpdate() {
    if(this.titleAttr !== this.titleContent) {
      this.titleContent = this.titleAttr;
    }
  }

  @action
  onTitleUpdate(content: string) {
    console.log('Update: ', content);
    this.args.updateAttribute('__title', content)
  }
}
