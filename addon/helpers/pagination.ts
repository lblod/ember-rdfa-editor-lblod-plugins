import { helper } from '@ember/component/helper';

import { isSome } from '../utils/option';

interface PaginationArguments {
  count: number;
  pageSize: number;
  page: number;
}

export function pagination({
  page = 0,
  count = 0,
  pageSize = 20,
}: PaginationArguments) {
  const totalPages = count / pageSize;
  const pageStart = page * pageSize + 1;
  const pageEnd = Math.min((page + 1) * pageSize, count);
  const nextPage = page < totalPages - 1 ? page + 1 : null;
  const previousPage = page > 0 ? page - 1 : null;
  const hasPreviousPage = isSome(previousPage);
  const hasNextPage = isSome(nextPage);

  return {
    count,
    pageSize,
    page,
    totalPages,
    pageStart,
    pageEnd,
    nextPage,
    previousPage,
    hasPreviousPage,
    hasNextPage,
  };
}

export default helper<unknown[], PaginationArguments>((_, named) =>
  pagination(named),
);
