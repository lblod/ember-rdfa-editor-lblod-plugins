// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import factory from 'rdf-ext';
import { Readable } from 'stream-browserify';
import { ProseStore } from '@lblod/ember-rdfa-editor/addon/plugins/datastore';

export default async function validateDatastore(
  datastore: ProseStore,
  shaclConstraint: string
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const s = new Readable();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  s.push(shaclConstraint);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  s.push(null);
  const parser = new ParserN3({ factory });
  const shapes = await factory.dataset().import(parser.import(s));
  const data = datastore.dataset;
  const validator = new SHACLValidator(shapes, { factory });
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const report = await validator.validate(data);
  return report;
}
