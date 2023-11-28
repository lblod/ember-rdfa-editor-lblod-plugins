import { NodeSpec, PNode, RdfaAttrs, Schema } from '@lblod/ember-rdfa-editor';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
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
  level?: number;
  number?: string;
  headerType?: string;
  headingProperty?: string;
};
export function constructStructureHeader({
  schema,
  backlinkResource,
  titleRdfaId,
  titleText,
  level,
  number,
  headerType = 'structure_header',
  headingProperty,
}: ConstructArgs) {
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
    { level, number, property: headingProperty },
    schema.node('structure_header_title', titleAttrs, schema.text(titleText)),
  );
}
