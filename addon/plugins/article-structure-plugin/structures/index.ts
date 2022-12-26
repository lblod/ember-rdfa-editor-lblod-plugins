import { ArticleStructurePluginOptions } from '..';
import { chapterSpec, chapter, chapter_body } from './chapter';
import { sectionSpec, section, section_body } from './section';
import { structure_header } from './structure-header';
import { subsectionSpec, subsection, subsection_body } from './subsection';

export const STRUCTURE_SPECS: ArticleStructurePluginOptions = [
  chapterSpec,
  sectionSpec,
  subsectionSpec,
  // {
  //   name: 'article',
  //   context: ['subsection', 'section', 'chapter'],
  //   constructor: () => {
  //     return new PNode();
  //   },
  // },
  // {
  //   name: 'paragraph',
  //   context: ['article'],
  //   constructor: () => {
  //     return new PNode();
  //   },
  // },
];

export const STRUCTURE_NODES = {
  structure_header,
  chapter,
  chapter_body,
  section,
  section_body,
  subsection,
  subsection_body,
};
