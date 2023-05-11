import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/addon/utils/ember-node';
import { action } from '@ember/object';
import { Command, PNode } from '@lblod/ember-rdfa-editor';
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

/**
 * A structured block will contain a heading and children.
 * The children can be one or more articles and one or more (non-article) subblocks.
 * If this component is an article, some extra edge cases are handled.
 */
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

  get subStructureConfig() {
    return this.parentAttrs.config.child;
  }

  get canHaveSubStructure() {
    return !!this.subStructureConfig;
  }

  get hasChildren() {
    return !!this.node.lastChild;
  }

  get hasSubStructure() {
    return (
      this.node.lastChild?.type.name === this.subStructureConfig?.structure_name
    );
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
    let copiedNode: PNode;
    if (this.isArticle) {
      copiedNode = this.node.type.create(
        null,
        this.schema.nodes.structure_content.create()
      );
    } else {
      copiedNode = this.node.type.create();
    }
    const pos = this.parentArgs.getPos();
    return (state, dispatch) => {
      if (pos === undefined) {
        return false;
      }
      const endPos = pos + this.node.nodeSize;

      // for some reason this is false for an articleNode
      // if (!this.node.canAppend(copiedNode)) {
      //   return false;
      // }
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

  addSubStructureCommand(): Command {
    const pos = this.parentArgs.getPos();
    return (state, dispatch) => {
      if (
        pos === undefined ||
        !this.canHaveSubStructure ||
        !this.subStructureConfig
      ) {
        return false;
      }
      const endPos = pos + this.node.nodeSize - 1;
      const childNode =
        this.schema.nodes[this.subStructureConfig.structure_name].create();

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
  addSubStructure() {
    this.controller.doCommand(this.addSubStructureCommand());
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
