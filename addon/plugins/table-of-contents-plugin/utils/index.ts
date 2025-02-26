import { NodeWithPos } from '@curvenote/prosemirror-utils';
import { DOMOutputSpec, EditorState, PNode } from '@lblod/ember-rdfa-editor';

export type OutlineEntry = {
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

type LegacyConfig = { nodeHierarchy: string[] }[];
type NewConfig = Record<string, never>;

export function extractOutline(args: {
  node: PNode;
  pos: number;
  /** @deprecated */
  config?: LegacyConfig | NewConfig;
  state: EditorState;
}): OutlineEntry[] {
  const { node, pos, config, state } = args;
  if (config && Array.isArray(config)) {
    return extractOutlineLegacy({ ...args, config });
  }
  let result: OutlineEntry[] = [];
  let parent: OutlineEntry | undefined;
  const tocEntry = node.type.spec.tocEntry as
    | ((node: PNode, state: EditorState) => string)
    | string
    | undefined;
  if (tocEntry) {
    let entry: string;
    if (typeof tocEntry === 'function') {
      entry = tocEntry(node, state);
    } else {
      entry = tocEntry;
    }
    parent = {
      pos,
      content: entry,
    };
  }
  const subResults: OutlineEntry[] = [];
  node.forEach((child, offset) => {
    subResults.push(
      ...extractOutline({ node: child, pos: pos + 1 + offset, config, state }),
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

function extractOutlineLegacy({
  node,
  pos,
  config,
  state,
}: {
  node: PNode;
  pos: number;
  config: LegacyConfig;
  state: EditorState;
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
          | ((node: PNode, state: EditorState) => string)
          | undefined;
        const content =
          outlineText?.(currentNode.node, state) ??
          currentNode.node.textContent;
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
      ...extractOutline({ node: child, pos: pos + 1 + offset, config, state }),
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
