import { Schema } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { v4 as uuid } from 'uuid';

export function buildArticleStructure(
  schema: Schema,
  uriGenerator?: () => string,
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
      ] satisfies OutgoingTriple[],
      hasTitle: false,
      structureName: 'Artikel',
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
