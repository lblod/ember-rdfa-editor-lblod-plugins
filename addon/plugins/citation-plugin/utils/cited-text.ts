import { PNode } from '@lblod/ember-rdfa-editor';
import { CitationSchema } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { v4 as uuid } from 'uuid';

export function citedText(
  schema: CitationSchema,
  title: string,
  uri: string
): PNode {
  return schema.text(title, [
    unwrap(schema.marks.citation).create({
      href: uri,
      property: 'eli:cites',
      typeof: 'eli:LegalExpression',
      __rdfaId: uuid(),
    }),
  ]);
}
