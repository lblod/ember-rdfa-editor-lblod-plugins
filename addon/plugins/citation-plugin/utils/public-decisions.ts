import {
  executeCountQuery,
  executeQuery,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';
import {
  dateValue,
  escapeValue,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';

import {
  LegalDocumentsQueryConfig,
  LegalDocument,
  LegalDocumentsQueryFilter,
  LegalDocumentsCollection,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';
import { Binding } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/types';
import { replaceDiacriticsInWord } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/utils';

const getFilters = ({
  words,
  filter,
}: {
  words: string[];
  filter: LegalDocumentsQueryFilter;
}) => {
  const { documentDateFrom, documentDateTo } = filter || {};

  const documentDateFilter =
    documentDateFrom || documentDateTo
      ? ['?session prov:startedAtTime ?documentDate .']
      : ['OPTIONAL { ?session prov:startedAtTime ?documentDate . }'];

  if (documentDateFrom) {
    documentDateFilter.push(
      `FILTER (?documentDate >= "${documentDateFrom}"^^xsd:date)`,
    );
  }

  if (documentDateTo) {
    documentDateFilter.push(
      `FILTER (?documentDate <= "${documentDateTo}"^^xsd:date) `,
    );
  }

  const governmentNameFilter = filter.governmentName?.trim()
    ? `FILTER (CONTAINS(LCASE(?governmentName), "${replaceDiacriticsInWord(
        filter.governmentName,
      ).toLowerCase()}"))`
    : '';

  return `
    ${words
      .map(
        (word) =>
          `FILTER (CONTAINS(LCASE(?decisionTitle), "${replaceDiacriticsInWord(
            word,
          ).toLowerCase()}"))`,
      )
      .join('\n')}
    ${documentDateFilter.join('\n')}
    ${governmentNameFilter}
    `;
};

const getCountQuery = ({
  words,
  filter,
}: {
  words: string[];
  filter: LegalDocumentsQueryFilter;
}) => {
  const filterString = getFilters({ words, filter });

  return `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX eli: <http://data.europa.eu/eli/ontology#>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    PREFIX schema: <http://schema.org/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT (COUNT(DISTINCT(?decision)) as ?count) WHERE {
      ?session rdf:type besluit:Zitting;
        mu:uuid ?zittingUuid;
        (besluit:isGehoudenDoor/mandaat:isTijdspecialisatieVan/skos:prefLabel) ?governmentName;
        ext:besluitenlijst ?decisionList.
      ?decisionList ext:besluitenlijstBesluit ?decision.
      ?decision eli:title ?decisionTitle.
      OPTIONAL {
        ?agenda rdf:type besluit:BehandelingVanAgendapunt;
          prov:generated ?decision.
        ?treatment rdf:type ext:Uittreksel;
          ext:uittrekselBvap ?agenda;
          mu:uuid ?treatmentUuida.
      }
      ${filterString}
    }
  `;
};

const getQuery = ({
  words,
  filter,
  pageNumber,
  pageSize,
}: {
  words: string[];
  filter: LegalDocumentsQueryFilter;
  pageNumber: number;
  pageSize: number;
}) => {
  const filterString = getFilters({ words, filter });

  return `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX eli: <http://data.europa.eu/eli/ontology#>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    PREFIX schema: <http://schema.org/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT DISTINCT ?governmentName ?decision ?decisionTitle ?documentDate ?zittingUuid ?treatmentUuid WHERE {
      ?session rdf:type besluit:Zitting;
        mu:uuid ?zittingUuid;
        (besluit:isGehoudenDoor/mandaat:isTijdspecialisatieVan/skos:prefLabel) ?governmentName;
        ext:besluitenlijst ?decisionList.
      ?decisionList ext:besluitenlijstBesluit ?decision.
      ?decision eli:title ?decisionTitle.
      OPTIONAL {
        ?agenda rdf:type besluit:BehandelingVanAgendapunt;
          prov:generated ?decision.
        ?treatment rdf:type ext:Uittreksel;
          ext:uittrekselBvap ?agenda;
          mu:uuid ?treatmentUuid.
      }
      ${filterString}
    }
    ORDER BY DESC (?documentDate) (?decisionTitle) LIMIT ${pageSize} OFFSET ${
      pageNumber * pageSize
    }
  `;
};

interface PublicDecisionLegalDocumentBinding {
  governmentName: Binding<string>;
  decision: Binding<string>;
  decisionTitle: Binding<string>;
  documentDate?: Binding<string>;
  zittingUuid: Binding<string>;
  treatmentUuid?: Binding<string>;
}

export async function fetchPublicDecisions({
  words,
  filter,
  pageNumber = 0,
  pageSize = 5,
  config,
}: {
  words: string[];
  config: LegalDocumentsQueryConfig;
  filter: LegalDocumentsQueryFilter;
  pageNumber?: number;
  pageSize?: number;
}): Promise<LegalDocumentsCollection> {
  const totalCount = await executeCountQuery({
    query: getCountQuery({ words, filter }),
    ...config,
  });

  if (totalCount > 0) {
    const response = await executeQuery<PublicDecisionLegalDocumentBinding>({
      query: getQuery({ words, filter, pageNumber, pageSize }),
      ...config,
    });

    const legalDocuments = response.results.bindings.map((binding) => {
      const escapedGovernmentName =
        escapeValue(binding.governmentName.value) ?? '';

      const escapedTitle = escapeValue(binding.decisionTitle.value) ?? '';

      const publicationDate = dateValue(
        binding.documentDate && binding.documentDate.value,
      );

      const documentDate = dateValue(
        binding.documentDate && binding.documentDate.value,
      );

      return new LegalDocument({
        uri: binding.decision.value,
        title: `${escapedGovernmentName} - ${escapedTitle}`,
        legislationTypeUri: filter.type,
        publicationDate,
        documentDate,
        meta: {
          publicationLink:
            binding.zittingUuid.value && binding.treatmentUuid?.value
              ? getPublicationLink({
                  zittingUuid: binding.zittingUuid.value,
                  treatmentUuid: binding.treatmentUuid.value,
                })
              : null,
        },
      });
    });

    return {
      totalCount,
      legalDocuments,
    };
  }

  return {
    totalCount,
    legalDocuments: [],
  };
}

const getPublicationLink = ({
  zittingUuid,
  treatmentUuid,
}: {
  zittingUuid: string;
  treatmentUuid: string;
}) =>
  `https://publicatie.gelinkt-notuleren.lblod.info/Edegem/Gemeente/zittingen/${zittingUuid}/uittreksels/${treatmentUuid}`;
