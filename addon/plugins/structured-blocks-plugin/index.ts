import { SayController } from '@lblod/ember-rdfa-editor';
import {
  title,
  titleView,
  chapter,
  chapterView,
  section,
  sectionView,
  subsection,
  subsectionView,
  article,
  articleView,
  content,
  contentView,
} from './nodes';

export const STRUCTURE_NODES = {
  structure_title: title,
  structure_chapter: chapter,
  structure_section: section,
  structure_subsection: subsection,
  structure_article: article,
  structure_content: content,
};

export function STRUCTURE_VIEWS(controller: SayController) {
  return {
    structure_title: titleView(controller),
    structure_chapter: chapterView(controller),
    structure_section: sectionView(controller),
    structure_subsection: subsectionView(controller),
    structure_article: articleView(controller),
  };
}
