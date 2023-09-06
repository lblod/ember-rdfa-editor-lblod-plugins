import {
  isBesluitType,
  LEGISLATION_TYPE_CONCEPTS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/types';
import { fetchVlaamseCodexLegalDocuments } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/vlaamse-codex';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { fetchPublicDecisions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/public-decisions';

interface LegalDocumentArgs {
  uri: string;
  legislationTypeUri: Option<string>;
  title: string | null;
  publicationDate: string | null;
  documentDate: string | null;
  meta?: Record<string, unknown> | null;
}

export class LegalDocument {
  uri: string;
  legislationType: { label: string; value: string } | undefined;
  title: string | null;
  publicationDate: string | null;
  documentDate: string | null;
  meta: Record<string, unknown> | null;

  constructor({
    uri,
    legislationTypeUri,
    title,
    publicationDate,
    documentDate,
    meta,
  }: LegalDocumentArgs) {
    this.uri = uri;
    this.legislationType = LEGISLATION_TYPE_CONCEPTS.find(
      (t) => t.value === legislationTypeUri,
    );
    this.title = title;
    this.publicationDate = publicationDate;
    this.documentDate = documentDate;
    this.meta = meta ?? null;
  }

  get fullTitle() {
    return `${this.legislationType?.label ?? ''} ${this.title ?? ''}`;
  }
}

export const isBesluitLegalDocument = (legalDocument: LegalDocument) =>
  isBesluitType(legalDocument.legislationType?.value ?? '');

export const fetchLegalDocumentsCache = new Map<
  string,
  LegalDocumentsCollection
>();

export interface LegalDocumentsCollection {
  totalCount: number;
  legalDocuments: LegalDocument[];
}

export interface LegalDocumentsQueryFilter {
  type: string;
  documentDateFrom?: Option<string>;
  documentDateTo?: Option<string>;
  publicationDateFrom?: Option<string>;
  publicationDateTo?: Option<string>;
}

export type LegalDocumentsQueryConfig = {
  endpoint: string;
  decisionsEndpoint?: string;
  abortSignal?: AbortSignal;
};

export async function fetchLegalDocuments({
  words,
  filter,
  pageNumber = 0,
  pageSize = 5,
  config,
}: {
  words: string[];
  filter: LegalDocumentsQueryFilter;
  pageNumber: number;
  pageSize: number;
  config: LegalDocumentsQueryConfig;
}) {
  //This is silly, but null != undefined, so we have to be careful and include the correct value here
  //Also, reconstruct the whole filter object to always have the same ordering, hopefully.
  filter = {
    type: filter.type,
    documentDateFrom: filter.documentDateFrom || null,
    documentDateTo: filter.documentDateTo || null,
    publicationDateFrom: filter.publicationDateFrom || null,
    publicationDateTo: filter.publicationDateTo || null,
  };
  const stringArguments = JSON.stringify({
    words,
    filter,
    pageNumber,
    pageSize,
  });
  const results = fetchLegalDocumentsCache.get(stringArguments);

  if (results) {
    return results;
  } else {
    const shouldQueryPublicDecisions =
      isBesluitType(filter.type) && config.decisionsEndpoint;

    const fetchConfig = {
      words,
      filter,
      pageNumber,
      pageSize,
      config: {
        endpoint: shouldQueryPublicDecisions
          ? (config.decisionsEndpoint as string)
          : config.endpoint,
        abortSignal: config.abortSignal,
      },
    };

    const newResults = shouldQueryPublicDecisions
      ? await fetchPublicDecisions(fetchConfig)
      : await fetchVlaamseCodexLegalDocuments(fetchConfig);

    fetchLegalDocumentsCache.set(stringArguments, newResults);

    return newResults;
  }
}
