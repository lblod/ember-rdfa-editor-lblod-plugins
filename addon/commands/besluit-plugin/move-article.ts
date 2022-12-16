import { Command, ProseController } from '@lblod/ember-rdfa-editor';
import { recalculateArticleNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/commands/besluit-plugin';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

export default function moveArticleCommand(
  controller: ProseController,
  besluitUri: string,
  articleUri: string,
  moveUp: boolean
): Command {
  return (_state, dispatch) => {
    const besluitValuePredicateNode = [
      ...controller.datastore
        .match(`>${besluitUri}`, 'prov:value')
        .asPredicateNodeMapping()
        .nodes(),
    ][0];
    if (!besluitValuePredicateNode) {
      return false;
    }
    const articles: ResolvedPNode[] = [];
    besluitValuePredicateNode.node.content.forEach((child, offset) => {
      if (
        child.attrs['typeof'] ===
          'http://data.vlaanderen.be/ns/besluit#Artikel' ||
        child.attrs['typeof'] === 'besluit:Artikel'
      ) {
        articles.push({
          node: child,
          pos: besluitValuePredicateNode.pos + 1 + offset,
        });
      }
    });
    const articleIndex = articles.findIndex(
      (article) => article.node.attrs['resource'] === articleUri
    );

    if (
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
      recalculateArticleNumbers(controller);
    }
    return true;
  };
}
