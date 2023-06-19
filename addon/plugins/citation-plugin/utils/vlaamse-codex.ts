import { LEGISLATION_TYPE_CONCEPTS } from './legislation-types';
import { warn } from '@ember/debug';
import {
  Option,
  optionMapOr,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

interface DecisionArgs {
  uri: string;
  legislationTypeUri: Option<string>;
  title: string | null;
  publicationDate: string | null;
  documentDate: string | null;
}

export class Decision {
  uri: string;
  legislationType: { label: string; value: string } | undefined;
  title: string | null;
  publicationDate: string | null;
  documentDate: string | null;

  constructor({
    uri,
    legislationTypeUri,
    title,
    publicationDate,
    documentDate,
  }: DecisionArgs) {
    this.uri = uri;
    this.legislationType = LEGISLATION_TYPE_CONCEPTS.find(
      (t) => t.value === legislationTypeUri
    );
    this.title = title;
    this.publicationDate = publicationDate;
    this.documentDate = documentDate;
  }

  get fullTitle() {
    return `${this.legislationType?.label ?? ''} ${this.title ?? ''}`;
  }
}

interface ArticleArgs {
  uri: string;
  number?: number;
  content: string | null;
  dateInForce: string | null;
  dateNoLongerInForce: string | null;
}

export class Article {
  uri: string;
  number?: number;
  content: string | null;
  dateInForce: string | null;
  dateNoLongerInForce: string | null;

  constructor({
    uri,
    number,
    content,
    dateInForce,
    dateNoLongerInForce,
  }: ArticleArgs) {
    this.uri = uri;
    this.number = number;
    this.content = content;
    this.dateInForce = dateInForce;
    this.dateNoLongerInForce = dateNoLongerInForce;
  }
}

/*
 * flemish codex encodes certain characters as a html character, which breaks our search
 * this is an ugly work around
 */
function replaceDiacriticsInWord(word: string): string {
  const characters =
    'Ë À Ì Â Í Ã Î Ä Ï Ç Ò È Ó É Ô Ê Õ Ö ê Ù ë Ú î Û ï Ü ô Ý õ â û ã ÿ ç'.split(
      ' '
    );
  for (const char of characters) {
    word = word.replace(new RegExp(`${char}`, 'g'), `&#${char.charCodeAt(0)};`);
  }
  return word;
}

//Attempt to memoise on the fetching by stringifying the arguments. This could spare a few fetches.
//If memoising fails, at least a normal fetch is performed.

const fetchDecisionsMemory = new Map<string, DecisionCollection>();

export interface QueryFilter {
  type: string;
  documentDateFrom?: Option<string>;
  documentDateTo?: Option<string>;
  publicationDateFrom?: Option<string>;
  publicationDateTo?: Option<string>;
}

async function fetchDecisions({
  words,
  filter,
  pageNumber = 0,
  pageSize = 5,
  config,
}: {
  words: string[];
  filter: QueryFilter;
  pageNumber: number;
  pageSize: number;
  config: CodexQueryConfig;
}) {
  /*abortSignal*/
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
  const results = fetchDecisionsMemory.get(stringArguments);
  if (results) {
    return results;
  } else {
    const newResults = await fetchDecisionsMemo({
      words,
      filter,
      pageNumber,
      pageSize,
      config,
    });
    fetchDecisionsMemory.set(stringArguments, newResults);
    return newResults;
  }
}

interface DecisionCollection {
  totalCount: number;
  decisions: Decision[];
}

async function fetchDecisionsMemo({
  words,
  filter,
  pageNumber = 0,
  pageSize = 5,
  config,
}: {
  words: string[];
  filter: QueryFilter;
  config: CodexQueryConfig;
  pageNumber?: number;
  pageSize?: number;
}): Promise<DecisionCollection> {
  // TBD/NOTE: in the context of a <http://data.europa.eu/eli/ontology#LegalResource>
  // the eli:cites can have either a <http://xmlns.com/foaf/0.1/Document> or <http://data.europa.eu/eli/ontology#LegalResource>
  // as range (see AP https://data.vlaanderen.be/doc/applicatieprofiel/besluit-publicatie/#Rechtsgrond),
  // but I currently don't think in the editor you'll ever directly work on a LegalResource.
  const {
    type,
    documentDateFrom,
    documentDateTo,
    publicationDateFrom,
    publicationDateTo,
  } = filter || {};

  let documentDateFilter =
    'OPTIONAL { ?legalResourceUri eli:date_document ?documentDate . }';
  if (documentDateFrom || documentDateTo) {
    documentDateFilter = '?legalResourceUri eli:date_document ?documentDate . ';
    if (documentDateFrom)
      documentDateFilter += `FILTER (?documentDate >= "${documentDateFrom}"^^xsd:date) `;
    if (documentDateTo)
      documentDateFilter += `FILTER (?documentDate <= "${documentDateTo}"^^xsd:date) `;
  }

  let publicationDateFilter =
    'OPTIONAL { ?expressionUri eli:date_publication ?publicationDate . }';
  if (publicationDateFrom || publicationDateTo) {
    publicationDateFilter =
      '?expressionUri eli:date_publication ?publicationDate . ';
    if (publicationDateFrom)
      publicationDateFilter += `FILTER (?publicationDate >= "${publicationDateFrom}"^^xsd:date) `;
    if (publicationDateTo)
      publicationDateFilter += `FILTER (?publicationDate <= "${publicationDateTo}"^^xsd:date) `;
  }

  const excludeAdaptationFilters = [];
  if (!words.includes('houdende')) {
    excludeAdaptationFilters.push(
      'FILTER(! STRSTARTS(LCASE(?title),"houdende"))'
    );
  }
  if (!words.includes('wijziging')) {
    excludeAdaptationFilters.push(
      'FILTER(! STRSTARTS(LCASE(?title),"tot wijziging"))'
    );
  }
  const totalCount = await executeCountQuery({
    query: `PREFIX eli: <http://data.europa.eu/eli/ontology#>

      SELECT COUNT(DISTINCT(?expressionUri)) as ?count
      WHERE {
        ?legalResourceUri eli:type_document <${type}> ;
                          eli:is_realized_by ?expressionUri .
        ?expressionUri a <http://data.europa.eu/eli/ontology#LegalExpression> .
        ?expressionUri eli:title ?title .
        ${words
          .map(
            (word) =>
              `FILTER (CONTAINS(LCASE(?title), "${replaceDiacriticsInWord(
                word
              ).toLowerCase()}"))`
          )
          .join('\n')}
        ${excludeAdaptationFilters.join('\n')}
        ${documentDateFilter}
        ${publicationDateFilter}
      }`,
    config,
  });

  if (totalCount > 0) {
    const response = await executeQuery<DecisionBinding>({
      query: `PREFIX eli: <http://data.europa.eu/eli/ontology#>

        SELECT DISTINCT ?expressionUri as ?uri ?title ?publicationDate ?documentDate
        WHERE {
          ?legalResourceUri eli:type_document <${type}> ;
                            eli:is_realized_by ?expressionUri .
          ?expressionUri a <http://data.europa.eu/eli/ontology#LegalExpression> .
          ?expressionUri eli:title ?title .
          ${words
            .map(
              (word) =>
                `FILTER (CONTAINS(LCASE(?title), "${replaceDiacriticsInWord(
                  word
                ).toLowerCase()}"))`
            )
            .join('\n')}
          OPTIONAL { ?expressionUri eli:date_publication ?publicationDate . }
          ${excludeAdaptationFilters.join('\n')}
          ${documentDateFilter}
          ${publicationDateFilter}
        } ORDER BY ?title LIMIT ${pageSize} OFFSET ${pageNumber * pageSize}`,
      config,
    });

    const decisions = response.results.bindings.map((binding) => {
      const escapedTitle = escapeValue(binding.title.value);
      const publicationDate = dateValue(
        binding.publicationDate && binding.publicationDate.value
      );
      const documentDate = dateValue(
        binding.documentDate && binding.documentDate.value
      );
      return new Decision({
        uri: binding.uri.value,
        title: escapedTitle,
        legislationTypeUri: type,
        publicationDate,
        documentDate,
      });
    });

    return {
      totalCount,
      decisions,
    };
  } else {
    return {
      totalCount,
      decisions: [],
    };
  }
}

interface Binding<A> {
  value: A;
}

interface DecisionBinding {
  uri: Binding<string>;
  title: Binding<string>;
  publicationDate: Binding<string>;
  documentDate: Binding<string>;
}

const fetchArticlesMemory = new Map<string, ArticleCollection>();

async function fetchArticles({
  legalExpression,
  pageNumber,
  pageSize,
  articleFilter,
  config,
}: {
  legalExpression: string;
  pageNumber: number;
  pageSize: number;
  articleFilter: string;
  config: CodexQueryConfig;
}): Promise<ArticleCollection> {
  //Simpler here, only one way arguments are set up
  const stringArguments = JSON.stringify({
    legalExpression,
    pageNumber,
    pageSize,
    articleFilter,
  });
  const results = fetchArticlesMemory.get(stringArguments);
  if (results) {
    return results;
  } else {
    const newResults = await fetchArticlesMemo({
      legalExpression,
      pageNumber,
      pageSize,
      articleFilter,
      config,
    });
    fetchArticlesMemory.set(stringArguments, newResults);
    return newResults;
  }
}

interface ArticleBinding {
  count: {
    value: string;
  };
  content?: {
    value: string;
  };
  dateInForce?: {
    value: string;
  };
  dateNoLongerInForce?: {
    value: string;
  };
  article: {
    value: string;
  };
  number?: {
    value: number;
  };
}

interface QueryResponse<B> {
  results: {
    bindings: B[];
  };
}

interface ArticleCollection {
  totalCount: number;
  articles: Article[];
}

async function fetchArticlesMemo({
  legalExpression,
  pageNumber = 0,
  pageSize = 10,
  articleFilter,
  config,
}: {
  legalExpression: string;
  pageNumber: number;
  pageSize: number;
  articleFilter: string;
  config: CodexQueryConfig;
}): Promise<ArticleCollection> {
  const numberFilter = articleFilter
    ? `FILTER( !BOUND(?number) || CONTAINS(?number, "${articleFilter}"))`
    : '';
  const totalCount = await executeCountQuery({
    query: `PREFIX eli: <http://data.europa.eu/eli/ontology#>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT COUNT(DISTINCT(?article)) as ?count
    WHERE {
        ?legalResource eli:is_realized_by <${legalExpression}> ;
                       eli:has_part ?articleResource .
        ?articleResource eli:is_realized_by ?article ;
                         dct:type <https://data.vlaanderen.be/id/concept/TypeRechtsbrononderdeel/Artikel>.
        OPTIONAL {
           ?article eli:first_date_entry_in_force ?dateInForce .
           FILTER (?dateInForce <= NOW() )
        }
        OPTIONAL { ?article eli:date_no_longer_in_force ?dateNoLongerInForce }
        FILTER( !BOUND(?dateNoLongerInForce) || ?dateNoLongerInForce > NOW() )
        OPTIONAL { ?article eli:number ?number . }
        ${numberFilter}
    }`,
    config,
  });

  if (totalCount > 0) {
    // ?number has format like "Artikel 12." We parse the number from the string for ordering
    // Second degree ordering on ?numberStr to make sure "Artikel 3/1." comes after "Artikel 3."
    const response = await executeQuery<ArticleBinding>({
      query: `PREFIX eli: <http://data.europa.eu/eli/ontology#>
      PREFIX prov: <http://www.w3.org/ns/prov#>
      PREFIX dct: <http://purl.org/dc/terms/>

      SELECT DISTINCT ?article ?dateInForce ?dateNoLongerInForce ?number ?content WHERE {
          ?legalResource eli:is_realized_by <${legalExpression}> ;
                         eli:has_part ?articleResource .
          ?articleResource eli:is_realized_by ?article ;
                           dct:type <https://data.vlaanderen.be/id/concept/TypeRechtsbrononderdeel/Artikel>.
          OPTIONAL {
            ?article eli:first_date_entry_in_force ?dateInForce .
            FILTER (?dateInForce <= NOW() )
          }
          OPTIONAL { ?article eli:date_no_longer_in_force ?dateNoLongerInForce }
          FILTER( !BOUND(?dateNoLongerInForce) || ?dateNoLongerInForce > NOW() )
          OPTIONAL { ?article prov:value ?content . }
          OPTIONAL { ?article eli:number ?number . }
          ${numberFilter}
          BIND(REPLACE(?number, "Artikel ", "") as ?numberStr)
          BIND(STRDT(?numberStr, xsd:integer) as ?numberInt)
      } ORDER BY ?numberInt ?numberStr LIMIT ${pageSize} OFFSET ${
        pageNumber * pageSize
      }`,
      config,
    });

    const articles = response.results.bindings.map((binding) => {
      const escapedContent = escapeValue(
        binding.content && binding.content.value
      );
      const dateInForce = dateValue(
        binding.dateInForce && binding.dateInForce.value
      );
      const dateNoLongerInForce = dateValue(
        binding.dateNoLongerInForce && binding.dateNoLongerInForce.value
      );
      return new Article({
        uri: binding.article.value,
        number: binding.number && binding.number.value,
        content: escapedContent,
        dateInForce,
        dateNoLongerInForce,
      });
    });

    return {
      totalCount,
      articles,
    };
  } else {
    return {
      totalCount,
      articles: [],
    };
  }
}

function cleanCaches() {
  fetchDecisionsMemory.clear();
  fetchArticlesMemory.clear();
}

function escapeValue(value?: string) {
  if (value) {
    const shadowDomElement = document.createElement('textarea');
    shadowDomElement.innerHTML = value;
    return shadowDomElement.textContent;
  } else {
    return null;
  }
}

function dateValue(value?: string): string | null {
  if (value) {
    try {
      return new Intl.DateTimeFormat('nl-BE').format(
        new Date(Date.parse(value))
      );
    } catch (e) {
      let message: string;
      if (e instanceof Error) {
        message = e.message;
      } else {
        message = e as string;
      }
      warn(`Error parsing date ${value}: ${message}`, {
        id: 'date-parsing-error',
      });
      return null;
    }
  } else {
    return null;
  }
}

async function executeCountQuery({
  query,
  config,
}: {
  query: string;
  config: CodexQueryConfig;
}) {
  const response = await executeQuery<{ count: { value: string } }>({
    query,
    config,
  });
  return optionMapOr(0, parseInt, response.results.bindings[0]?.count.value);
}

type CodexQueryConfig = { endpoint: string; abortSignal?: AbortSignal };

async function executeQuery<A>({
  query,
  config,
}: {
  query: string;
  config: CodexQueryConfig;
}): Promise<QueryResponse<A>> {
  const encodedQuery = encodeURIComponent(query.trim());

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `query=${encodedQuery}`,
    signal: config.abortSignal,
  });

  if (response.ok) {
    return response.json() as Promise<QueryResponse<A>>;
  } else {
    throw new Error(
      `Request to Vlaamse Codex was unsuccessful: [${response.status}] ${response.statusText}`
    );
  }
}

export { fetchDecisions, fetchArticles, cleanCaches };
