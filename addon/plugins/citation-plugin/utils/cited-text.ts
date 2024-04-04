import { PNode } from '@lblod/ember-rdfa-editor';
import { CitationSchema } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import {
  ELI,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

export function citedText(
  schema: CitationSchema,
  title: string,
  uri: string,
): PNode {
  const linkType = unwrap(schema.nodes.link);
  const linkSpec = linkType.spec;
  if (linkSpec.attrs && linkSpec.attrs['properties']) {
    // Link node-spec is RDFa-aware
    return linkType.create(
      {
        href: uri,
        subject: uri,
        rdfaNodeType: 'resource',
        properties: [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(ELI('LegalExpression').full),
          },
          {
            predicate: ELI('cites').full,
            object: sayDataFactory.contentLiteral(),
          },
        ],
      },
      schema.text(title),
    );
  } else {
    // Link node-spec uses classic RDFa
    return linkType.create(
      {
        href: uri,
        property: 'eli:cites',
        typeof: 'eli:LegalExpression',
      },
      [schema.text(title)],
    );
  }
}
