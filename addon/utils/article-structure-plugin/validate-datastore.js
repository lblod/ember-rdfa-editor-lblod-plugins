import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import factory from 'rdf-ext';
import { Readable } from 'stream-browserify';

export default async function validateDatastore(datastore, shaclConstraint) {
  const s = new Readable();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  s.push(shaclConstraint);
  s.push(null);
  const parser = new ParserN3({ factory });
  const shapes = await factory.dataset().import(parser.import(s));
  const data = datastore.dataset;
  const validator = new SHACLValidator(shapes, { factory });
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const report = await validator.validate(data);
  return report;
}
