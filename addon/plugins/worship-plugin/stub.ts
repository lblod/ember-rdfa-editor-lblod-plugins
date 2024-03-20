export interface WorshipPluginConfig {
  endpoint: string;
}
export type WorshipService = {
  name: string;
};
export interface WorshipServiceResponse {
  results: WorshipService[];
  totalCount: number;
}

export function fetchWorshipServices({
  sort,
  pagination: { pageSize, page },
}: {
  filter: Partial<WorshipService>;
  sort: string | false;
  pagination: {
    pageSize: number;
    page: number;
  };
  abortSignal: AbortSignal;
  config: WorshipPluginConfig;
}): Promise<WorshipServiceResponse> {
  const results = new Array(pageSize)
    .fill(0)
    .map((_, i) => ({ name: `page ${page}: result ${i}` }));
  if (sort === '-name') {
    results.reverse();
  }
  if (page === 3) {
    throw new Error('not 3?!?');
  }
  return Promise.resolve({
    totalCount: 70,
    results,
  });
}
