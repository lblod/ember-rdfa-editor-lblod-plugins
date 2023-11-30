import { NodeSpec, PNode, RdfaAttrs, Schema } from '@lblod/ember-rdfa-editor';
import {
  EXT,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { constructStructureHeaderNodeSpec } from '../utils/structure';

export const structure_header: NodeSpec = constructStructureHeaderNodeSpec({
  includeLevel: true,
  outlineText: (node: PNode) => {
    const { number } = node.attrs;
    return `${number as string}. ${node.textContent}`;
  },
  numberContentDOM: (number) => [
    [
      'span',
      {
        contenteditable: false,
      },
      number,
    ],
    ['span', { contenteditable: false }, '. '],
  ],
});

type ConstructArgs = {
  schema: Schema;
  backlinkResource: string;
  titleRdfaId: string;
  titleText: string;
  headingRdfaId: string;
  headingProperty?: string;
  level?: number;
  number?: string;
  headerType?: string;
};
export function constructStructureHeader({
  schema,
  backlinkResource,
  titleRdfaId,
  titleText,
  headingRdfaId,
  headingProperty = SAY('heading').prefixed,
  level,
  number,
  headerType = 'structure_header',
}: ConstructArgs) {
  const headingAttrs: RdfaAttrs = {
    __rdfaId: headingRdfaId,
    rdfaNodeType: 'literal',
    backlinks: [
      {
        subject: backlinkResource,
        predicate: headingProperty,
      },
    ],
  };
  const titleAttrs: RdfaAttrs = {
    __rdfaId: titleRdfaId,
    rdfaNodeType: 'literal',
    backlinks: [
      {
        subject: backlinkResource,
        predicate: EXT('title').prefixed,
      },
    ],
  };
  return schema.node(
    headerType,
    { level, number, ...headingAttrs },
    schema.node('structure_header_title', titleAttrs, schema.text(titleText)),
  );
}
