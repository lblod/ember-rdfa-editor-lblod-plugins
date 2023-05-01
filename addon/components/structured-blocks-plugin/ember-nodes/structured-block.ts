import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/addon/utils/ember-node';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { localCopy } from 'tracked-toolbox';
import { Command } from '@lblod/ember-rdfa-editor';

declare type blockArgs = {
  emberNodeArgs: EmberNodeArgs;
  addText: string;
};

declare type blockAttrs = {
  text: string;
  childNode?: string;
};

export default class StructuredBlocksPluginEmberNodesStructuredBlockComponent extends Component<blockArgs> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @localCopy('text') declare localText: string | undefined;

  get parentArgs() {
    return this.args.emberNodeArgs;
  }

  get parentAttrs() {
    return this.node?.attrs as blockAttrs;
  }

  get node() {
    return this.parentArgs?.node;
  }

  get text(): string {
    return this.parentAttrs?.text || '';
  }

  get controller() {
    return this.parentArgs.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get childNode() {
    return this.parentAttrs?.childNode;
  }

  @action
  setText(event: InputEvent) {
    assert(
      'setText must be bound to an input element',
      event.target instanceof HTMLInputElement
    );
    this.parentArgs.updateAttribute('text', event.target.value);
  }

  addBlockCommand(): Command {
    const copiedNode = this.node.type.create();
    const pos = this.parentArgs.getPos();
    console.log(pos);
    return (state, dispatch) => {
      if (pos === undefined) {
        return false;
      }
      const endPos = pos + this.node.nodeSize;

      if (!this.node.canAppend(copiedNode)) {
        console.log('is false');
        return false;
      }
      if (dispatch) {
        dispatch(state.tr.replaceWith(endPos, endPos, copiedNode));
      }
      return true;
    };
  }

  addChildCommand(): Command {
    const pos = this.parentArgs.getPos();
    return (state, dispatch) => {
      if (pos === undefined || !this.childNode) {
        return false;
      }
      const endPos = pos + this.node.nodeSize - 1;
      const childNode = this.schema.nodes[this.childNode].create();

      // if (!this.node.canAppend(childNode)) {
      //   console.log('is false');
      //   return false;
      // }
      if (dispatch) {
        dispatch(state.tr.insert(endPos, childNode));
      }
      return true;
    };
  }

  addParagraphCommand(): Command {
    const paragraphNode = this.schema.nodes.structure_paragraph.create();
    const pos = this.parentArgs.getPos();

    return (state, dispatch) => {
      if (pos === undefined) {
        return false;
      }

      const insertPos = pos + 1;

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

  @action
  addParagraph() {
    this.controller.doCommand(this.addParagraphCommand());
  }

  @action
  addSameBelow() {
    this.controller.doCommand(this.addBlockCommand());
  }

  @action
  addChild() {
    this.controller.doCommand(this.addChildCommand());
  }
}
