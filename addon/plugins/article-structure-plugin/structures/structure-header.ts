import { NodeSpec, PNode, RdfaAttrs, Schema } from '@lblod/ember-rdfa-editor';
import {
  ELI,
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
});

type HeaderType = 'structure_header' | 'article_header';
const headerNodes = (
  schema: Schema,
): Record<
  HeaderType,
  { beforeNumberNodes?: PNode[]; afterNumberNodes: PNode[] }
> => ({
  structure_header: { afterNumberNodes: [schema.text('. ')] },
  article_header: {
    beforeNumberNodes: [schema.text('Artikel ')],
    afterNumberNodes: [schema.text(': ')],
  },
});

type ConstructArgs = {
  schema: Schema;
  backlinkResource: string;
  titleRdfaId: string;
  titleText: string;
  headingRdfaId: string;
  headingProperty?: string;
  numberRdfaId: string;
  number: string;
  level?: number;
  headerType?: HeaderType;
};
export function constructStructureHeader({
  schema,
  backlinkResource,
  titleRdfaId,
  titleText,
  headingRdfaId,
  headingProperty = SAY('heading').prefixed,
  numberRdfaId,
  number,
  level,
  headerType = 'structure_header',
}: ConstructArgs) {
  const { beforeNumberNodes = [], afterNumberNodes } =
    headerNodes(schema)[headerType];
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
  const numberAttrs: RdfaAttrs = {
    __rdfaId: numberRdfaId,
    rdfaNodeType: 'literal',
    backlinks: [
      {
        subject: backlinkResource,
        predicate: ELI('number').prefixed,
      },
    ],
  };
  return schema.node(headerType, { level, ...headingAttrs }, [
    ...beforeNumberNodes,
    schema.node('structure_header_number', numberAttrs, schema.text(number)),
    ...afterNumberNodes,
    schema.node('structure_header_title', titleAttrs, schema.text(titleText)),
  ]);
}
