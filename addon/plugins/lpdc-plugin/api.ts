import { LPDC } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lpdc-plugin/types';

import { LpdcPluginConfig } from './index';

type LPDCInstance = {
  id: string; // UUID
  '@id': string; // URI
  naam: {
    nl?: string;
    en?: string;
  };
  linkedConcept: string; // URI of linked concept
  linkedConceptId: string; // UUID of linked concept
  linkedConceptProductnummer: string;
};

type FetchResults = {
  hydraPageIndex: number;
  hydraLimit: number;
  hydraTotalItems: number;
  hydraMember: Array<LPDCInstance>;
  hydraView: {
    /**
     * String like
     * https://ipdc.tni-vlaanderen.be/doc/instantie?limit=25&pageIndex=0&sortBy=LAATST_GEWIJZIGD
     */
    hydraFirst: string;
    hydraLast: string;
    hydraNext?: string;
    hydraPrevious?: string;
  };
};

const getPageIndex = (url: string): number => {
  const urlSearchParams = new URL(url).searchParams;

  return parseInt(urlSearchParams.get('pageIndex') ?? '0');
};

export const fetchLpdcs = async ({
  config,
  filter,
  pageNumber,
}: {
  pageNumber: number;
  config: LpdcPluginConfig;
  filter?: {
    name?: string;
  };
}): Promise<{
  lpdc: Array<LPDC>;
  pageIndex: number;
  meta: {
    count: number;
    pagination: {
      first: { number: number };
      last: { number: number };
      next?: { number: number };
      prev?: { number: number };
    };
  };
}> => {
  const endpoint = `${config?.endpoint}/doc/instantie`;

  const url = endpoint.startsWith('/')
    ? new URL(endpoint, window.location.origin)
    : new URL(endpoint);

  if (filter?.name) {
    url.searchParams.append('zoekterm', filter.name);
  }

  if (pageNumber) {
    url.searchParams.append('pageIndex', pageNumber.toString());
  }

  const results = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!results.ok) {
    throw new Error(
      `Received '${results.status}: ${results.statusText}' when fetching from LPDC`,
    );
  }

  const resultJson = (await results.json()) as FetchResults;

  return {
    lpdc: (resultJson.hydraMember ?? [])
      .map((lpdc) => ({
        uri: lpdc['@id'],
        name: lpdc.naam.nl ?? lpdc.naam.en,
      }))
      .filter((lpdc): lpdc is LPDC => lpdc.name !== undefined),
    pageIndex: resultJson.hydraPageIndex,
    meta: {
      count: resultJson.hydraTotalItems,
      pagination: {
        first: {
          number: getPageIndex(resultJson.hydraView.hydraFirst),
        },
        next: resultJson.hydraView.hydraNext
          ? {
              number: getPageIndex(resultJson.hydraView.hydraNext),
            }
          : undefined,
        last: {
          number: getPageIndex(resultJson.hydraView.hydraLast),
        },
        prev: resultJson.hydraView.hydraPrevious
          ? {
              number: getPageIndex(resultJson.hydraView.hydraPrevious),
            }
          : undefined,
      },
    },
  };
};
