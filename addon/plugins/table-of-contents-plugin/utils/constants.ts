export type TableOfContentsConfig = {
  sectionPredicate: string[];
  value:
    | string
    | {
        predicate: string;
      };
}[];

export const TABLE_OF_CONTENTS_DEFAULT_CONFIG: TableOfContentsConfig = [
  {
    sectionPredicate: ['https://say.data.gift/ns/hasPart', 'say:hasPart'],
    value: {
      predicate: 'https://say.data.gift/ns/heading',
    },
  },
];
