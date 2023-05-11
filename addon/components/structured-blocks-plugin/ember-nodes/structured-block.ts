import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/addon/utils/ember-node';
import { action } from '@ember/object';
import { Command } from '@lblod/ember-rdfa-editor';
import { baseStructureConfigWithChild } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structured-blocks-plugin/nodes/config';

declare type blockArgs = {
  emberNodeArgs: EmberNodeArgs;
};

declare type blockAttrs = {
  text: string;
  showRemoveBorder: boolean;
  addBlockHover: boolean;
  config: baseStructureConfigWithChild;
};

export default class StructuredBlocksPluginEmberNodesStructuredBlockComponent extends Component<blockArgs> {
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

  set text(value: string) {
    this.parentArgs.updateAttribute('text', value);
  }

  get showRemoveBorder() {
    return this.parentAttrs?.showRemoveBorder;
  }

  get addBlockHover() {
    return this.parentAttrs?.addBlockHover;
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

  get hasChildren() {
    return !!this.node.lastChild;
  }

  get hasChildNode() {
    return this.node.lastChild?.type.name === this.childConfig?.structure_name;
  }

  get isArticle() {
    // an article is the bottom most structure that needs less UI.
    return this.config.type === 'article';
  }

  @action
  hoverRemoveButton(isHovered: boolean, _: MouseEvent) {
    if (this.showRemoveBorder !== isHovered) {
      this.parentArgs.updateAttribute('showRemoveBorder', isHovered);
    }
  }

  @action
  hoverChild(isChildHovered: boolean, _: MouseEvent) {
    // article's child (content) should not disable hover of article
    const addBlockHover = this.isArticle || !isChildHovered;
    if (this.addBlockHover !== addBlockHover) {
      this.parentArgs.updateAttribute('addBlockHover', addBlockHover);
    }
  }

  addBlockCommand(): Command {
    const copiedNode = this.node.type.create();
    const pos = this.parentArgs.getPos();
    return (state, dispatch) => {
      if (pos === undefined) {
        return false;
      }
      const endPos = pos + this.node.nodeSize;

      if (!this.node.canAppend(copiedNode)) {
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

      // 'check can remove
      // if (!this.node.canAppend(copiedNode)) {
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
      //   return false;
      // }
      if (dispatch) {
        dispatch(state.tr.insert(endPos, childNode));
      }
      return true;
    };
  }

  addArticleCommand(): Command {
    const articleNode = this.schema.nodes.structure_article.create(
      null,
      this.schema.nodes.structure_content.create()
    );
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

      // if (!this.node.canAppend(copiedNode)) {
      //   return false;
      // }
      if (dispatch) {
        dispatch(state.tr.insert(insertPos, articleNode));
      }
      return true;
    };
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
