import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  moveArticle,
  recalculateArticleNumbers,
} from '@lblod/ember-rdfa-editor-lblod-plugins/commands/besluit-plugin';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { DecisionOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-plugin';
import { ProseController } from '@lblod/ember-rdfa-editor';
import { getRdfaAttributes } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

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

  get doc() {
    return this.controller.state.doc;
  }
  focus() {
    this.controller.focus();
  }

  @action
  deleteArticle() {
    if (this.activeArticle && this.besluitURI) {
      const { from, to } = this.activeArticle;
      this.controller.withTransaction((tr) => {
        return tr.delete(from, to);
      });
      this.focus();
      recalculateArticleNumbers(this.controller, this.besluitURI);
    }
  }

  @action
  moveUpArticle() {
    if (this.besluitURI && this.activeArticleURI) {
      this.controller.doCommand(
        moveArticle(
          this.controller,
          this.besluitURI,
          this.activeArticleURI,
          true
        )
      );
    }
  }

  @action
  moveDownArticle() {
    if (this.besluitURI && this.activeArticleURI) {
      this.controller.doCommand(
        moveArticle(
          this.controller,
          this.besluitURI,
          this.activeArticleURI,
          false
        )
      );
    }
  }

  get disableMoveUp() {
    if (this.besluitURI && this.activeArticleURI) {
      return !this.controller.checkCommand(
        moveArticle(
          this.controller,
          this.besluitURI,
          this.activeArticleURI,
          true
        )
      );
    }
    return true;
  }

  get disableMoveDown() {
    if (this.besluitURI && this.activeArticleURI) {
      return !this.controller.checkCommand(
        moveArticle(
          this.controller,
          this.besluitURI,
          this.activeArticleURI,
          false
        )
      );
    }
    return true;
  }

  get besluitURI() {
    const { from, to } = this.controller.state.selection;

    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      from,
      to
    );
    return limitedDatastore
      .match(null, 'a', 'besluit:Besluit')
      .asQuadResultSet()
      .first()?.subject.value;
  }

  get activeArticle() {
    if (this.besluitURI) {
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
    return;
  }

  get activeArticleURI() {
    if (this.activeArticle) {
      return getRdfaAttributes(unwrap(this.doc.nodeAt(this.activeArticle.from)))
        ?.resource;
    }
    return;
  }
}
