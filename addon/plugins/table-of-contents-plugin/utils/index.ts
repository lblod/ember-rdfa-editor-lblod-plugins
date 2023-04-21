type OutlineEntry = {
  content: string;
  pos: number;
  children?: OutlineEntry[];
};

type LI = (
  | string
  | { class: string; type?: string }
  | (string | { class: string; type?: string } | LI)[]
)[];

export function createTableOfContents(entries: OutlineEntry[]) {
  const tableOfContents: LI = [
    'ul',
    {
      class:
        'au-c-list au-c-list--vertical au-c-list--divider table-of-contents',
    },
  ];

  for (let i = 0; i < entries.length; i++) {
    const item: OutlineEntry = entries[i];
    const li: LI = [
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
