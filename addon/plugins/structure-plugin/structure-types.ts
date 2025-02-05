import { SAY } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { type Resource } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export type StructureType =
  | 'title'
  | 'article'
  | 'chapter'
  | 'section'
  | 'subsection'
  | 'paragraph';

export interface StructureConfig {
  rdfType: Resource;
  hasTitle: boolean;
  structureType: StructureType;
  resourceUri: string;
  headerFormat?: 'plain-number' | 'name' | 'section-symbol';
  headerTag?: string;
  romanize: boolean;
}

export const STRUCTURE_HIERARCHY: StructureConfig[] = [
  {
    rdfType: SAY('Title'),
    hasTitle: true,
    structureType: 'title',
    resourceUri: 'http://data.lblod.info/titles/',
    // Temporarily display the name as in the current design it's not clear which structure is which
    // headerFormat: 'plain-number',
    headerFormat: 'name',
    headerTag: 'h3',
    romanize: false,
  },
  {
    rdfType: SAY('Chapter'),
    hasTitle: true,
    structureType: 'chapter',
    resourceUri: 'http://data.lblod.info/chapters/',
    // Temporarily display the name as in the current design it's not clear which structure is which
    // headerFormat: 'plain-number',
    headerFormat: 'name',
    headerTag: 'h4',
    romanize: true,
  },
  {
    rdfType: SAY('Section'),
    hasTitle: true,
    structureType: 'section',
    resourceUri: 'http://data.lblod.info/sections/',
    // Temporarily display the name as in the current design it's not clear which structure is which
    // headerFormat: 'plain-number',
    headerFormat: 'name',
    headerTag: 'h5',
    romanize: true,
  },
  {
    rdfType: SAY('Subsection'),
    hasTitle: true,
    structureType: 'subsection',
    resourceUri: 'http://data.lblod.info/subsections/',
    // Temporarily display the name as in the current design it's not clear which structure is which
    // headerFormat: 'plain-number',
    headerFormat: 'name',
    headerTag: 'h6',
    romanize: false,
  },
  {
    rdfType: SAY('Article'),
    hasTitle: true,
    structureType: 'article',
    resourceUri: 'http://data.lblod.info/articles/',
    headerFormat: 'name',
    romanize: false,
  },
  {
    rdfType: SAY('Paragraph'),
    hasTitle: true,
    structureType: 'paragraph',
    resourceUri: 'http://data.lblod.info/paragraphs/',
    headerFormat: 'section-symbol',
    romanize: false,
  },
];
