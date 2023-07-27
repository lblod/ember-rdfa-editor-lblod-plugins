// This file contains helpers for both the codelist and location variable types

import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { CodeListOption } from './fetch-data';
import { PNode, ProseParser, SayController } from '@lblod/ember-rdfa-editor';

function wrapVariableInHighlight(text: string) {
  return text.replace(
    /\$\{(.+?)\}/g,
    '<span class="mark-highlight-manual">${$1}</span>',
  );
}

export function updateCodelistVariable(
  selectedCodelist: {
    node: PNode;
    pos: number;
  },
  selectedOption: CodeListOption | CodeListOption[],
  controller: SayController,
) {
  let htmlToInsert: string;
  if (Array.isArray(selectedOption)) {
    htmlToInsert = selectedOption.map((option) => option.value).join(', ');
  } else {
    htmlToInsert = unwrap(selectedOption.value);
  }
  htmlToInsert = wrapVariableInHighlight(htmlToInsert);
  const domParser = new DOMParser();
  const htmlNode = domParser.parseFromString(htmlToInsert, 'text/html');
  const contentFragment = ProseParser.fromSchema(controller.schema).parseSlice(
    htmlNode,
    {
      preserveWhitespace: false,
    },
  ).content;
  const range = {
    from: selectedCodelist.pos + 1,
    to: selectedCodelist.pos + selectedCodelist.node.nodeSize - 1,
  };
  controller.withTransaction(
    (tr) => {
      return tr.replaceWith(range.from, range.to, contentFragment);
    },
    { view: controller.mainEditorView },
  );
}
