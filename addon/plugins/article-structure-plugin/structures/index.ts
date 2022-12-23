import { ArticleStructurePluginOptions } from '..';
import { chapter, chapterStructure, chapter_content } from './chapter';
import { section, sectionStructure, section_content } from './section';
import { structure_header } from './structure_header';
import {
  subsection,
  subsectionStructure,
  subsection_content,
} from './subsection';

export const STRUCTURE_SPECS: ArticleStructurePluginOptions = [
  chapterStructure,
  sectionStructure,
  subsectionStructure,
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
  chapter_content,
  section,
  section_content,
  subsection,
  subsection_content,
};
