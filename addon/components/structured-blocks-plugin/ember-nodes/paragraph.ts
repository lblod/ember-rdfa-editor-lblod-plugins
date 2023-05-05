import { action } from '@ember/object';
import Component from '@glimmer/component';
import { Command } from '@lblod/ember-rdfa-editor';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/addon/utils/ember-node';

// eslint-disable-next-line ember/no-empty-glimmer-component-classes
export default class StructuredBlocksPluginEmberNodesParagraphComponent extends Component<EmberNodeArgs> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  addParagraph() {
    this.controller.doCommand(this.addParagraphCommand());
  }

  addParagraphCommand(): Command {
    const paragraphNode = this.schema.nodes.structure_paragraph.create();
    const pos = this.args.getPos();

    return (state, dispatch) => {
      if (pos === undefined) {
        return false;
      }

      const insertPos = pos + this.args.node.nodeSize;

      console.log(insertPos);
      // if (!this.node.canAppend(copiedNode)) {
      //   console.log('is false');
      //   return false;
      // }
      if (dispatch) {
        dispatch(state.tr.insert(insertPos, paragraphNode));
      }
      return true;
    };
  }

  removeParagraphCommand(): Command {
    const startPos = this.args.getPos();
    return (state, dispatch) => {
      if (startPos === undefined) {
        return false;
      }
      const endPos = startPos + this.args.node.nodeSize;
      console.log(startPos, endPos);

      // 'check can remove
      // if (!this.node.canAppend(copiedNode)) {
      //   console.log('is false');
      //   return false;
      // }
      if (dispatch) {
        dispatch(state.tr.delete(startPos, endPos));
      }
      return true;
    };
  }

  @action
  removeParagraph() {
    this.controller.doCommand(this.removeParagraphCommand());
  }
}
