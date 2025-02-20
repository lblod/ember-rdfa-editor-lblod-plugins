import { ArticleStructurePluginOptions } from '..';
import { structureWithConfig } from '../../structure-plugin/node';

/** @deprecated Is now just an empty array, move to using structure-plugin */
export const STRUCTURE_SPECS: ArticleStructurePluginOptions = [];

/** @deprecated Use the structure-plugin nodes and nodeviews directly */
export const STRUCTURE_NODES = {
  structure: structureWithConfig({
    onlyArticleSpecialName: false,
    fullLengthArticles: true,
  }),
  title: structureWithConfig({
    onlyArticleSpecialName: false,
    fullLengthArticles: true,
  }),
  chapter: structureWithConfig({
    onlyArticleSpecialName: false,
    fullLengthArticles: true,
  }),
  section: structureWithConfig({
    onlyArticleSpecialName: false,
    fullLengthArticles: true,
  }),
  subsection: structureWithConfig({
    onlyArticleSpecialName: false,
    fullLengthArticles: true,
  }),
  article: structureWithConfig({
    onlyArticleSpecialName: false,
    fullLengthArticles: true,
  }),
  article_paragraph: structureWithConfig({
    onlyArticleSpecialName: false,
    fullLengthArticles: true,
  }),
};
