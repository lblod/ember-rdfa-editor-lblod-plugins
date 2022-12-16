import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  moveArticle,
  recalculateArticleNumbers,
} from '@lblod/ember-rdfa-editor-lblod-plugins/commands/besluit-plugin';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/addon/plugins/datastore';
import { DecisionOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-plugin';
import { ProseController } from '@lblod/ember-rdfa-editor';

interface ContextCardWidgetArgs {
  options?: DecisionOptions;
}

interface Args {
  controller: ProseController;
  widgetArgs: ContextCardWidgetArgs;
}

export default class BesluitContextCardComponent extends Component<Args> {
  @tracked articleElement?: ResolvedPNode;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
  }

  get controller() {
    return this.args.controller;
  }

  @action
  deleteArticle() {
    const articleNode = this.activeArticleNode;
    if (articleNode && this.besluit) {
      this.controller.withTransaction((tr) => {
        return tr.delete(
          articleNode.pos,
          articleNode.pos + articleNode.node.nodeSize
        );
      });
      recalculateArticleNumbers(
        this.controller,
        this.besluit.node.attrs['resource']
      );
    }
  }

  @action
  moveUpArticle() {
    if (this.besluit && this.activeArticleNode) {
      this.controller.doCommand(
        moveArticle(
          this.controller,
          this.besluit.node.attrs['resource'],
          this.activeArticleNode.node.attrs['resource'],
          true
        )
      );
    }
  }

  @action
  moveDownArticle() {
    if (this.besluit && this.activeArticleNode) {
      this.controller.doCommand(
        moveArticle(
          this.controller,
          this.besluit.node.attrs['resource'],
          this.activeArticleNode.node.attrs['resource'],
          false
        )
      );
    }
  }

  get disableMoveUp() {
    if (this.besluit && this.activeArticleNode) {
      return !this.controller.checkCommand(
        moveArticle(
          this.controller,
          this.besluit.node.attrs['resource'],
          this.activeArticleNode.node.attrs['resource'],
          true
        )
      );
    }
    return true;
  }

  get disableMoveDown() {
    if (this.besluit && this.activeArticleNode) {
      return !this.controller.checkCommand(
        moveArticle(
          this.controller,
          this.besluit.node.attrs['resource'],
          this.activeArticleNode.node.attrs['resource'],
          false
        )
      );
    }
    return true;
  }

  get besluit() {
    const { from, to } = this.controller.state.selection;

    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      from,
      to
    );
    return [
      ...limitedDatastore
        .match(null, 'a', 'besluit:Besluit')
        .asSubjectNodeMapping()
        .nodes(),
    ][0];
  }

  get activeArticleNode() {
    if (this.besluit) {
      const { from, to } = this.controller.state.selection;

      const limitedDatastore = this.controller.datastore.limitToRange(
        this.controller.state,
        from,
        to
      );
      return [
        ...limitedDatastore
          .match(null, 'a', 'besluit:Artikel')
          .asSubjectNodeMapping()
          .nodes(),
      ][0];
    }
  }
}
