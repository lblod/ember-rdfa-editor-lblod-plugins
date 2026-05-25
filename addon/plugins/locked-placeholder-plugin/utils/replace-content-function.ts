import { Node, SayController } from '@lblod/ember-rdfa-editor';
import { DOMParser as ProseParser } from '@lblod/ember-rdfa-editor';

type PlaceholderWithPos = {
  placeholder: Node;
  pos: number;
};

type ReplacementValues = {
  [key: string]: string;
};

export default function replaceLockedPlaceholderContent(
  controller: SayController,
  values: ReplacementValues,
) {
  const doc = controller.mainEditorState.doc;
  const placeholdersWithPos: PlaceholderWithPos[] = [];
  doc.descendants((node, pos) => {
    if (
      node.type.name === 'block_locked_placeholder' ||
      node.type.name === 'inline_locked_placeholder'
    ) {
      placeholdersWithPos.push({
        placeholder: node,
        pos: pos,
      });
      return false;
    }
    return true;
  });
  placeholdersWithPos.reverse();
  for (const { placeholder, pos } of placeholdersWithPos) {
    const key = placeholder.attrs.key as string;
    const valueToReplace = values[key];
    if (!valueToReplace) continue;
    if (typeof valueToReplace === 'string') {
      replacePlaceholderWithHtml(controller, placeholder, pos, valueToReplace);
    } else {
      replacePlaceholderWithProsemirrorNode(
        controller,
        placeholder,
        pos,
        valueToReplace,
      );
    }
  }
}

function replacePlaceholderWithHtml(
  controller: SayController,
  placeholder: Node,
  pos: number,
  value: string,
) {
  console.log(placeholder);
  const domParser = new DOMParser();
  const contentFragment = ProseParser.fromSchema(controller.schema).parse(
    domParser.parseFromString(value, 'text/html'),
  ).content;
  controller.withTransaction(
    (transaction) => {
      return transaction.replaceWith(
        pos,
        pos + placeholder.nodeSize,
        contentFragment,
      );
    },
    { view: controller.mainEditorView },
  );
}

function replacePlaceholderWithProsemirrorNode(
  controller: SayController,
  placeholder: Node,
  pos: number,
  value: Node,
) {
  controller.withTransaction(
    (transaction) => {
      return transaction.replaceWith(pos, pos + placeholder.nodeSize, value);
    },
    { view: controller.mainEditorView },
  );
}
