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
    ? `FILTER (CONTAINS(LCASE(?administrativeUnitName), "${replaceDiacriticsInWord(
        filter.governmentName?.trim(),
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
    FILTER(BOUND(?decisionTitle))
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
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT (COUNT(DISTINCT(?decision)) as ?count) WHERE {
      ?session rdf:type besluit:Zitting;
        mu:uuid ?zittingUuid;
        (besluit:isGehoudenDoor/mandaat:isTijdspecialisatieVan) ?administrativeUnit.
      ?administrativeUnit skos:prefLabel ?administrativeUnitFullName;
        besluit:bestuurt ?bestuurseenheid.
      ?bestuurseenheid skos:prefLabel ?administrativeUnitName;
        (besluit:classificatie/skos:prefLabel) ?administrativeUnitTypeName.
      OPTIONAL {
        ?session besluit:behandelt ?agendaPoint.
        ?agendaPointTreatment dct:subject ?agendaPoint;
          prov:generated ?decision.
        ?decision eli:title ?decisionTitleViaAgenda.
      }
      OPTIONAL {
        ?session ext:uittreksel ?treatment.
        ?treatment mu:uuid ?treatmentUuid.
        ?treatment ext:uittrekselBvap ?agendaPointTreatment.
        ?agendaPointTreatment prov:generated ?decision.
        ?decision eli:title ?decisionTitleViaTreatment.
      }
      BIND(COALESCE(?decisionTitleViaAgenda, ?decisionTitleViaTreatment) as ?decisionTitle)
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
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?administrativeUnitFullName ?administrativeUnitTypeName ?administrativeUnitName ?documentDate ?decision ?decisionTitle ?zittingUuid ?treatmentUuid WHERE {
      ?session rdf:type besluit:Zitting;
        mu:uuid ?zittingUuid;
        (besluit:isGehoudenDoor/mandaat:isTijdspecialisatieVan) ?administrativeUnit.
      ?administrativeUnit skos:prefLabel ?administrativeUnitFullName;
        besluit:bestuurt ?bestuurseenheid.
      ?bestuurseenheid skos:prefLabel ?administrativeUnitName;
        (besluit:classificatie/skos:prefLabel) ?administrativeUnitTypeName.
      OPTIONAL {
        ?session besluit:behandelt ?agendaPoint.
        ?agendaPointTreatment dct:subject ?agendaPoint;
          prov:generated ?decision.
        ?decision eli:title ?decisionTitleViaAgenda.
      }
      OPTIONAL {
        ?session ext:uittreksel ?treatment.
        ?treatment mu:uuid ?treatmentUuid.
        ?treatment ext:uittrekselBvap ?agendaPointTreatment.
        ?agendaPointTreatment prov:generated ?decision.
        ?decision eli:title ?decisionTitleViaTreatment.
      }
      BIND(COALESCE(?decisionTitleViaAgenda, ?decisionTitleViaTreatment) as ?decisionTitle)
      ${filterString}
    }
    ORDER BY DESC (?documentDate) (?decisionTitle) LIMIT ${pageSize} OFFSET ${
      pageNumber * pageSize
    }
  `;
};

interface PublicDecisionLegalDocumentBinding {
  administrativeUnitName: Binding<string>;
  administrativeUnitTypeName: Binding<string>;
  administrativeUnitFullName: Binding<string>;
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
        escapeValue(binding.administrativeUnitFullName.value) ?? '';

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
                  administrativeUnitName: binding.administrativeUnitName.value,
                  administrativeUnitTypeName:
                    binding.administrativeUnitTypeName.value,
                  zittingUuid: binding.zittingUuid.value,
                  treatmentUuid: binding.treatmentUuid.value,
                  decisionsEndpoint: config.endpoint,
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
  administrativeUnitName,
  administrativeUnitTypeName,
  zittingUuid,
  treatmentUuid,
  decisionsEndpoint,
}: {
  administrativeUnitName: string;
  administrativeUnitTypeName: string;
  zittingUuid: string;
  treatmentUuid: string;
  decisionsEndpoint: string;
}) => {
  return `https://${
    new URL(decisionsEndpoint).host
  }/${administrativeUnitName}/${administrativeUnitTypeName}/zittingen/${zittingUuid}/uittreksels/${treatmentUuid}`;
};
