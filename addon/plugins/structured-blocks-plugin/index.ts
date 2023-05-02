import { title, titleView } from './nodes/title';
import { chapter, chapterView } from './nodes/chapter';
import { section, sectionView } from './nodes/section';
import { subsection, subsectionView } from './nodes/subsection';
import { article, articleView } from './nodes/article';
import { paragraph, paragraphView } from './nodes/paragraph';

export const STRUCTURE_NODES = {
  structure_title: title,
  structure_chapter: chapter,
  structure_section: section,
  structure_subsection: subsection,
  structure_article: article,
  structure_paragraph: paragraph,
};

export function STRUCTURE_VIEWS(controller: any) {
  return {
    structure_title: titleView(controller),
    structure_chapter: chapterView(controller),
    structure_section: sectionView(controller),
    structure_subsection: subsectionView(controller),
    structure_article: articleView(controller),
    structure_paragraph: paragraphView(controller),
  };
}
