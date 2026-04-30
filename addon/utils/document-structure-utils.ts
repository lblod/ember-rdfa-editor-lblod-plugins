import { EditorState } from '@lblod/ember-rdfa-editor';
import { PNode } from '@lblod/ember-rdfa-editor';

export function getArticleNodes(state: EditorState) {
  const articles: { node: PNode; pos: number }[] = [];

  state.doc.descendants((node, pos) => {
    if (node.attrs.structureType === 'article') {
      articles.push({ node, pos });
      return false;
    }

    return true;
  });

  return articles;
}
