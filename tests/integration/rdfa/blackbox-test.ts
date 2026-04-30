/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { module, test } from 'qunit';
import TEST_CASES from './test-cases';
import { EditorStore } from '@lblod/ember-rdfa-editor/utils/_private/datastore/datastore';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import {
  SAMPLE_PLUGINS,
  SAMPLE_SCHEMA,
  testEditor,
} from 'dummy/tests/utils/editor';
//@ts-expect-error No types for some reason
import toNT from '@rdfjs/to-ntriples';

function calculateDataset(html: string) {
  const domParser = new DOMParser();
  const parsedHTML = domParser.parseFromString(html, 'text/html');
  const datastore = EditorStore.fromParse<Node>({
    parseRoot: true,
    root: parsedHTML,
    baseIRI: 'http://example.org',
    tag: tagName,
    attributes(node: Node): Record<string, string> {
      if (isElement(node)) {
        const result: Record<string, string> = {};
        for (const attr of node.attributes) {
          result[attr.name] = attr.value;
        }
        return result;
      }
      return {};
    },
    isText: isTextNode,
    children(node: Node): Iterable<Node> {
      return node.childNodes;
    },
    pathFromDomRoot: [],
    textContent(node: Node): string {
      return node.textContent || '';
    },
  });
  return datastore.dataset;
}

module('Integration | RDFa blackbox test ', function () {
  for (const entry of Object.entries(TEST_CASES)) {
    const [key, html] = entry;
    test(`underlying RDF stays intact - test case ${key}`, async function (assert) {
      const initialDataset = calculateDataset(html);
      const { controller } = testEditor(SAMPLE_SCHEMA, SAMPLE_PLUGINS);
      controller.initialize(html);
      const outputHTML = controller.htmlContent;
      // run through the editor twice to test for stability
      controller.initialize(outputHTML);

      const finalHTML = controller.htmlContent;
      assert.strictEqual(outputHTML, finalHTML);
      const resultingDataset = calculateDataset(finalHTML);
      const isEqual = initialDataset.equals(resultingDataset);
      const initialTurtle = (await toNT(initialDataset)).trim();
      const resultingTurtle = (await toNT(resultingDataset)).trim();
      const message = `
        Before:
        ${initialTurtle || '<empty>'}
        After:
        ${resultingTurtle || '<empty>'}
        In 'before' but not in 'after':
        ${await toNT(initialDataset.difference(resultingDataset))}
        In 'after' but not in 'before':
        ${await toNT(resultingDataset.difference(initialDataset))}
      `;
      assert.true(isEqual, message);
    });
  }
});
