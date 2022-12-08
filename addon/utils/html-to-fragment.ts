import {
  isAllWhitespace,
  isElement,
  isTextNode,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { Fragment, Schema } from 'prosemirror-model';
import { DOMParser as ProseParser } from 'prosemirror-model';
import { normalToPreWrapWhiteSpace } from '@lblod/ember-rdfa-editor/utils/whitespace-collapsing';
export default function htmlToFragment(
  html: string,
  schema: Schema,
  preserveWhitespace = false
): Fragment {
  const domParser = new DOMParser();
  const htmlNode = domParser.parseFromString(html, 'text/html');
  if (!preserveWhitespace) {
    cleanUpNode(htmlNode);
  }
  const fragment = ProseParser.fromSchema(schema).parseSlice(htmlNode, {
    preserveWhitespace,
  }).content;
  return fragment;
}

function cleanUpNode(node: Node) {
  if (isTextNode(node)) {
    node.textContent = normalToPreWrapWhiteSpace(node);
  } else if ('childNodes' in node) {
    node.childNodes.forEach(cleanUpNode);
  }
}
