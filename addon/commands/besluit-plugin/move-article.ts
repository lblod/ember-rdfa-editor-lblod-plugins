import {
  Command,
  ProseController,
  Selection,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { recalculateArticleNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/commands/besluit-plugin';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import getArticleNodesForBesluit from './get-article-nodes-for-besluit';

export default function moveArticleCommand(
  controller: ProseController,
  besluitUri: string,
  articleUri: string,
  moveUp: boolean
): Command {
  return (_state, dispatch) => {
    const articles = getArticleNodesForBesluit(controller, besluitUri);
    if (!articles) {
      return false;
    }
    const articleIndex = articles.findIndex(
      (article) => article.node.attrs['resource'] === articleUri
    );

    if (
      articleIndex === -1 ||
      (moveUp && articleIndex === 0) ||
      (!moveUp && articleIndex === articles.length - 1)
    ) {
      return false;
    }

    if (dispatch) {
      let articleA: ResolvedPNode;
      let articleB: ResolvedPNode;
      if (moveUp) {
        articleA = unwrap(articles[articleIndex - 1]);
        articleB = unwrap(articles[articleIndex]);
      } else {
        articleA = unwrap(articles[articleIndex]);
        articleB = unwrap(articles[articleIndex + 1]);
      }
      const articleBRange = {
        from: articleB.pos,
        to: articleB.pos + articleB.node.nodeSize,
      };
      controller.withTransaction((tr) => {
        tr.delete(articleBRange.from, articleBRange.to);
        return tr.replaceRangeWith(articleA.pos, articleA.pos, articleB.node);
      });
      recalculateArticleNumbers(controller, besluitUri);
      let selection: Selection;
      if (moveUp) {
        selection = TextSelection.near(
          controller.state.doc.resolve(articleA.pos)
        );
      } else {
        selection = TextSelection.near(
          controller.state.doc.resolve(articleA.pos + articleB.node.nodeSize)
        );
      }
      controller.withTransaction((tr) => {
        return tr.setSelection(selection);
      });
      controller.focus();
    }
    return true;
  };
}
