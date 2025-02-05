import { Schema } from '@lblod/ember-rdfa-editor';
import {
  BESLUIT,
  ELI,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  type IncomingTriple,
  type OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { v4 as uuid } from 'uuid';
import { type StructureConfig } from '../../structure-plugin/structure-types';

export function generateStructureAttrs({
  config,
  subject,
  properties = [],
  backlinks,
}: {
  config: StructureConfig;
  subject: string;
  // TODO Remove these and also link decision structures using relationship combinators
  properties?: OutgoingTriple[];
  backlinks?: IncomingTriple[];
}) {
  const factory = new SayDataFactory();
  return {
    rdfaNodeType: 'resource',
    properties: [
      {
        predicate: RDF('type').full,
        object: factory.namedNode(config.rdfType.full),
      },
      ...properties,
    ] satisfies OutgoingTriple[],
    backlinks,
    hasTitle: config.hasTitle,
    structureType: config.structureType,
    headerTag: config.headerTag,
    headerFormat: config.headerFormat,
    romanize: config.romanize,
    subject,
  };
}

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
  const factory = new SayDataFactory();
  let articleResource: string;
  if (uriGenerator) {
    articleResource = uriGenerator();
  } else {
    const articleId = uuid();
    articleResource = `http://data.lblod.info/artikels/--ref-uuid4-${articleId}`;
  }
  return schema.node(
    'structure',
    generateStructureAttrs({
      config: {
        structureType: 'article',
        rdfType: BESLUIT('Artikel'),
        resourceUri: 'http://data.lblod.info/artikels/',
        hasTitle: false,
        headerFormat: 'name',
        romanize: false,
        headerTag: 'h5',
      },
      subject: articleResource,
      properties: [
        {
          predicate: PROV('value').full,
          object: factory.contentLiteral(),
        },
      ],
      backlinks: !decisionUri
        ? undefined
        : [
            {
              subject: factory.resourceNode(decisionUri),
              predicate: ELI('has_part').full,
            },
          ],
    }),
    schema.node(
      'paragraph',
      {},
      schema.node('placeholder', { placeholderText: 'Voeg inhoud artikel in' }),
    ),
  );
}
