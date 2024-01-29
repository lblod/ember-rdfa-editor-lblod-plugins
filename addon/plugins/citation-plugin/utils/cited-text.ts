import { PNode } from '@lblod/ember-rdfa-editor';
import { CitationSchema } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

type Citation = {
  title: string;
  uri: string;
  url: string;
};

export function citedText(schema: CitationSchema, citation: Citation): PNode {
  const { title, uri, url } = citation;
  return unwrap(schema.nodes.link).create(
    {
      property: 'eli:cites',
      resource: uri,
      href: url,
      typeof: 'eli:LegalExpression',
    },
    [schema.text(title)],
  );
}
