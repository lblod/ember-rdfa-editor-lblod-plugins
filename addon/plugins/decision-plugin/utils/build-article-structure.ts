import { Schema } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  ELI,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { v4 as uuid } from 'uuid';

export function buildArticleStructure(
  schema: Schema,
  uriGenerator?: () => string,
  /**
   * Adds a backlink to this resource instead of relying on being linked to the decision after
   * creation.
   * Adding backlinks like this does not play nice with the RDFa tools, but if combined with a
   * document with this URI imported it works as expected. It creates valid RDFa in either case.
   */
  decisionUri?: string,
) {
  let articleResource: string;
  if (uriGenerator) {
    articleResource = uriGenerator();
  } else {
    const articleId = uuid();
    articleResource = `http://data.lblod.info/artikels/--ref-uuid4-${articleId}`;
  }
  const factory = new SayDataFactory();
  return schema.node(
    'structure',
    {
      rdfaNodeType: 'resource',
      properties: [
        {
          predicate: RDF('type').full,
          object: factory.namedNode(BESLUIT('Artikel').full),
        },
        {
          predicate: PROV('value').full,
          object: factory.contentLiteral(),
        },
      ] satisfies OutgoingTriple[],
      //TODO: we should move this logic of adding the backlink to the `insertArticle` transaction-monad
      backlinks: !decisionUri
        ? undefined
        : [
            {
              subject: factory.resourceNode(decisionUri),
              predicate: ELI('has_part'),
            },
          ],
      hasTitle: false,
      structureType: 'article',
      displayStructureName: true,
      headerTag: 'h5',
      subject: articleResource,
    },
    schema.node(
      'paragraph',
      {},
      schema.node('placeholder', { placeholderText: 'Voeg inhoud artikel in' }),
    ),
  );
}
