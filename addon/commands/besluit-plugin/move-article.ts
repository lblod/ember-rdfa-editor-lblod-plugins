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
    console.log('ARTICLES: ', articles);
    if (!articles) {
      return false;
    }
    const articleIndex = articles.findIndex(({ uri }) => uri === articleUri);

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
        articleA = unwrap(articles[articleIndex - 1]).range;
        articleB = unwrap(articles[articleIndex]).range;
      } else {
        articleA = unwrap(articles[articleIndex]).range;
        articleB = unwrap(articles[articleIndex + 1]).range;
      }
      const articleBNode = unwrap(controller.state.doc.nodeAt(articleB.from));
      controller.withTransaction((tr) => {
        tr.delete(articleB.from, articleB.to);
        return tr.replaceRangeWith(articleA.from, articleA.from, articleBNode);
      });
      recalculateArticleNumbers(controller, besluitUri);
      let selection: Selection;
      if (moveUp) {
        selection = TextSelection.near(
          controller.state.doc.resolve(articleA.from)
        );
      } else {
        selection = TextSelection.near(
          controller.state.doc.resolve(
            articleA.from + articleB.to - articleB.from
          )
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
