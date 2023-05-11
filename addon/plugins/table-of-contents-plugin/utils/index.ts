import { DOMOutputSpec, PNode } from '@lblod/ember-rdfa-editor';
import { NodeWithPos } from '@curvenote/prosemirror-utils';

type OutlineEntry = {
  content: string;
  pos: number;
  children?: OutlineEntry[];
};

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export function createTableOfContents(entries: OutlineEntry[]) {
  const tableOfContents: Mutable<DOMOutputSpec> = [
    'ul',
    {
      class: 'au-u-background-gray-100 au-u-padding-tiny table-of-contents',
    },
  ];

  for (let i = 0; i < entries.length; i++) {
    const item: OutlineEntry = entries[i];
    const li: Mutable<DOMOutputSpec> = [
      'li',
      { class: 'au-c-list__item' },
      [
        'button',
        {
          class: 'au-c-button au-c-button--link-secondary au-c-button--wrap',
          type: 'button',
        },
        item.content,
      ],
    ];

    if (item.children?.length) {
      const children = createTableOfContents(item.children);
      li.push(children);
    }
    tableOfContents.push(li);
  }
  return tableOfContents;
}

type Config = { nodeHierarchy: string[] }[];

export function extractOutline({
  node,
  pos,
  config,
}: {
  node: PNode;
  pos: number;
  config: Config;
}): OutlineEntry[] {
  let result: OutlineEntry[] = [];
  let parent: OutlineEntry | undefined;
  for (const option of config) {
    const { nodeHierarchy } = option;
    if (RegExp(`^${nodeHierarchy[0]}$`).exec(node.type.name)) {
      let i = 1;
      let currentNode: NodeWithPos | undefined = { node, pos };
      while (currentNode && i < nodeHierarchy.length) {
        let newCurrentNode: NodeWithPos | undefined;
        currentNode.node.forEach((child, offset) => {
          if (RegExp(`^${nodeHierarchy[i]}$`).exec(child.type.name)) {
            newCurrentNode = { pos: pos + offset, node: child };
            return;
          }
        });
        currentNode = newCurrentNode;
        i++;
      }
      if (currentNode) {
        const outlineText = currentNode.node.type.spec.outlineText as
          | ((node: PNode) => string)
          | undefined;
        const content =
          outlineText?.(currentNode.node) ?? currentNode.node.textContent;
        parent = {
          pos: currentNode.pos,
          content,
        };
      }
    }
  }
  const subResults: OutlineEntry[] = [];
  node.forEach((child, offset) => {
    subResults.push(
      ...extractOutline({ node: child, pos: pos + 1 + offset, config })
    );
  });
  if (parent) {
    parent.children = subResults;
    result = [parent];
  } else {
    result = subResults;
  }
  return result;
}
