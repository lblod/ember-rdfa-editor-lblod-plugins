import { Fragment, Schema } from 'prosemirror-model';
import { DOMParser as ProseParser } from 'prosemirror-model';

export default function htmlToFragment(
  html: string | Node,
  schema: Schema
): Fragment {
  let htmlNode: Node;
  if (typeof html === 'string') {
    const domParser = new DOMParser();
    htmlNode = domParser.parseFromString(html, 'text/html');
  } else {
    htmlNode = html;
  }

  return ProseParser.fromSchema(schema).parseSlice(htmlNode, {
    preserveWhitespace: false,
  }).content;
}
