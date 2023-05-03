import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/addon/utils/ember-node';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { localCopy } from 'tracked-toolbox';
import { Command } from '@lblod/ember-rdfa-editor';
import { baseStructureConfigWithChild } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structured-blocks-plugin/nodes/config';

declare type blockArgs = {
  emberNodeArgs: EmberNodeArgs;
};

declare type blockAttrs = {
  text: string;
  config: baseStructureConfigWithChild;
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

  get config() {
    return this.parentAttrs.config;
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

  get childConfig() {
    return this.parentAttrs.config.child;
  }

  get hasChild() {
    return !!this.childConfig;
  }

  get hasChildNode() {
    return this.node.lastChild?.type.name === this.childConfig?.structure_name;
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
    return (state, dispatch) => {
      if (pos === undefined) {
        return false;
      }
      const endPos = pos + this.node.nodeSize;
      console.log(endPos);

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

  removeBlockCommand(): Command {
    const startPos = this.parentArgs.getPos();
    return (state, dispatch) => {
      if (startPos === undefined) {
        return false;
      }
      const endPos = startPos + this.node.nodeSize;
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

  addChildCommand(): Command {
    const pos = this.parentArgs.getPos();
    return (state, dispatch) => {
      if (pos === undefined || !this.hasChild || !this.childConfig) {
        return false;
      }
      const endPos = pos + this.node.nodeSize - 1;
      const childNode =
        this.schema.nodes[this.childConfig.structure_name].create();

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

  addArticleCommand(): Command {
    const articleNode = this.schema.nodes.structure_article.create();
    const pos = this.parentArgs.getPos();

    return (state, dispatch) => {
      if (pos === undefined) {
        return false;
      }
      let offsetLastParagraph = 0;
      //find pos after articles
      this.node.forEach((node, offset, _index) => {
        if (node.type.name === 'structure_paragraph') {
          const currentEnd = offset + node.nodeSize;
          if (currentEnd > offsetLastParagraph) {
            offsetLastParagraph = currentEnd;
          }
        }
      });
      const insertPos = pos + offsetLastParagraph + 1;

      console.log(insertPos);
      // if (!this.node.canAppend(copiedNode)) {
      //   console.log('is false');
      //   return false;
      // }
      if (dispatch) {
        dispatch(state.tr.insert(insertPos, articleNode));
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

  @action
  addArticle() {
    this.controller.doCommand(this.addArticleCommand());
  }

  @action
  removeThis() {
    this.controller.doCommand(this.removeBlockCommand());
  }
}
