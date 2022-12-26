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

export const ZONAL_URI =
  'http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d';

export const POTENTIALLY_ZONAL_URI =
  'http://lblod.data.gift/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f';

export const NON_ZONAL_URI =
  'http://lblod.data.gift/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc';

export const MULTI_SELECT_CODELIST_TYPE =
  'http://lblod.data.gift/concepts/57C93E12-A02C-4D4B-8B95-666B6701286C';
