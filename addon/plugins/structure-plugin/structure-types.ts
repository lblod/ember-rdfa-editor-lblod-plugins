import { type PNode } from '@lblod/ember-rdfa-editor';
import {
  RDF,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
  type Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  type Option,
  optionMap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export type StructurePluginOptions = {
  uriGenerator:
    | 'uuid4'
    | 'template-uuid4'
    | ((structureType: StructureType) => string);
};

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
    hasTitle: false,
    structureType: 'paragraph',
    resourceUri: 'http://data.lblod.info/paragraphs/',
    headerFormat: 'section-symbol',
    romanize: false,
  },
];

export function isHierarchyNode(node: PNode) {
  return STRUCTURE_HIERARCHY.some(({ rdfType }) =>
    hasOutgoingNamedNodeTriple(node.attrs, RDF('type'), rdfType),
  );
}

export function findRankInHierarchy(rdfTypeString: string): Option<number> {
  return STRUCTURE_HIERARCHY.findIndex(({ rdfType }) =>
    rdfType.matches(rdfTypeString),
  );
}

/**
 * Get the 'rank' of a structure node in the hierarchy. `0` is the top, so a rank of `1` means it
 * fits inside the structure with rank `0`, etc.
 */
export function calculateHierarchyRank(nodePosition: {
  node: PNode;
  pos: number;
}) {
  const rdfType = getOutgoingTriple(nodePosition.node.attrs, RDF('type'))
    ?.object.value;
  const rnk = optionMap(findRankInHierarchy, rdfType);
  return optionMap((rank) => ({ ...nodePosition, rank }), rnk);
}
