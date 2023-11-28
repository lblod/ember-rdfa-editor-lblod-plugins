import { ArticleStructurePluginOptions } from '..';
import { article, articleSpec, article_body, article_header } from './article';
import { articleParagraphSpec, article_paragraph } from './article-paragraph';
import { chapterSpec, chapter, chapter_body } from './chapter';
import { titleSpec, title, title_body } from './title';
import { sectionSpec, section, section_body } from './section';
import { structure_header } from './structure-header';
import { structure_header_title } from './structure-header-title';
import { subsectionSpec, subsection, subsection_body } from './subsection';

export const STRUCTURE_SPECS: ArticleStructurePluginOptions = [
  titleSpec,
  chapterSpec,
  sectionSpec,
  subsectionSpec,
  articleSpec,
  articleParagraphSpec,
];

export const STRUCTURE_NODES = {
  structure_header,
  title,
  title_body,
  chapter,
  chapter_body,
  section,
  section_body,
  subsection,
  subsection_body,
  article,
  article_header,
  article_body,
  article_paragraph,
  structure_header_title,
};
