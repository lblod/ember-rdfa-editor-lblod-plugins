import {
  dateValue,
  escapeValue,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import {
  executeCountQuery,
  executeQuery,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import {
  LegalDocument,
  LegalDocumentsCollection,
  LegalDocumentsQueryConfig,
  LegalDocumentsQueryFilter,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';
import { Binding } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/types';
import { replaceDiacriticsInWord } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/utils';

interface VlaamseCodexLegalDocumentBinding {
  uri: Binding<string>;
  title: Binding<string>;
  publicationDate: Binding<string>;
  documentDate: Binding<string>;
}

export async function fetchVlaamseCodexLegalDocuments({
  words,
  filter,
  pageNumber = 0,
  pageSize = 5,
  config,
}: {
  words: string[];
  filter: LegalDocumentsQueryFilter;
  config: LegalDocumentsQueryConfig;
  pageNumber?: number;
  pageSize?: number;
}): Promise<LegalDocumentsCollection> {
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
                word,
              ).toLowerCase()}"))`,
          )
          .join('\n')}
        ${documentDateFilter}
        ${publicationDateFilter}
      }`,
    ...config,
  });

  if (totalCount > 0) {
    const response = await executeQuery<VlaamseCodexLegalDocumentBinding>({
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
                  word,
                ).toLowerCase()}"))`,
            )
            .join('\n')}
          OPTIONAL { ?expressionUri eli:date_publication ?publicationDate . }
          ${documentDateFilter}
          ${publicationDateFilter}
        } ORDER BY ?title LIMIT ${pageSize} OFFSET ${pageNumber * pageSize}`,
      ...config,
    });

    const legalDocuments = response.results.bindings.map((binding) => {
      const escapedTitle = escapeValue(binding.title.value);
      const publicationDate = dateValue(
        binding.publicationDate && binding.publicationDate.value,
      );
      const documentDate = dateValue(
        binding.documentDate && binding.documentDate.value,
      );
      return new LegalDocument({
        uri: binding.uri.value,
        title: escapedTitle,
        legislationTypeUri: type,
        publicationDate,
        documentDate,
      });
    });

    return {
      totalCount,
      legalDocuments,
    };
  } else {
    return {
      totalCount,
      legalDocuments: [],
    };
  }
}
