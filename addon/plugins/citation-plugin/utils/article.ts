import { LegalDocumentsQueryConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';
import {
  executeCountQuery,
  executeQuery,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import {
  dateValue,
  escapeValue,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { Binding } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/types';

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

export const fetchArticlesCache = new Map<string, ArticleCollection>();

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
  config: LegalDocumentsQueryConfig;
}): Promise<ArticleCollection> {
  //Simpler here, only one way arguments are set up
  const stringArguments = JSON.stringify({
    legalExpression,
    pageNumber,
    pageSize,
    articleFilter,
  });
  const results = fetchArticlesCache.get(stringArguments);
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
    fetchArticlesCache.set(stringArguments, newResults);
    return newResults;
  }
}

interface ArticleBinding {
  count: Binding<string>;
  content?: Binding<string>;
  dateInForce?: Binding<string>;
  dateNoLongerInForce?: Binding<string>;
  article: Binding<string>;
  number?: Binding<number>;
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
  config: LegalDocumentsQueryConfig;
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
    ...config,
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
      ...config,
    });

    const articles = response.results.bindings.map((binding) => {
      const escapedContent = escapeValue(
        binding.content && binding.content.value,
      );
      const dateInForce = dateValue(
        binding.dateInForce && binding.dateInForce.value,
      );
      const dateNoLongerInForce = dateValue(
        binding.dateNoLongerInForce && binding.dateNoLongerInForce.value,
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

export { fetchArticles };
