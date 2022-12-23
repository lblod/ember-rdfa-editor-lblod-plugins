import { ArticleStructurePluginOptions } from '..';
import { chapter_structure } from './chapter';
import { section_structure } from './section';
import { structure_header } from './structure_header';
import { subsection_structure } from './subsection';

export const STRUCTURE_SPECS: ArticleStructurePluginOptions = [
  chapter_structure.structureSpec,
  section_structure.structureSpec,
  subsection_structure.structureSpec,
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
  ...chapter_structure.nodeSpecs,
  ...section_structure.nodeSpecs,
  ...subsection_structure.nodeSpecs,
};
