import { v4 as uuid } from 'uuid';

export const decisionDoc = (decisionUri: string, content: string) => `
  <div lang="nl-BE" data-say-document="true">
    <div
      style="display: none"
      class="say-hidden"
      data-rdfa-container="true"
    ></div>
    <div data-content-container="true">
      <div
        class="say-editable say-block-rdfa"
        about="${decisionUri}"
        data-say-id="60a640e9-c7a7-43f6-8e9a-5ed6d8cc93e5"
      >
        <div style="display: none" class="say-hidden" data-rdfa-container="true">
          <span
            about="${decisionUri}"
            property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            resource="http://data.vlaanderen.be/ns/besluit#Besluit"
          ></span
          ><span
            about="${decisionUri}"
            property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            resource="http://mu.semte.ch/vocabularies/ext/BesluitNieuweStijl"
          ></span
          ><span
            about="${decisionUri}"
            property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            resource="https://data.vlaanderen.be/id/concept/BesluitType/4d8f678a-6fa4-4d5f-a2a1-80974e43bf34"
          ></span
          ><span
            rev="http://www.w3.org/ns/prov#generated"
            resource="http://example.org#"
          ></span>
        </div>
        <div data-content-container="true">
          <div
            class="say-editable say-block-rdfa"
            about="${decisionUri}"
            property="http://www.w3.org/ns/prov#value"
            datatype="http://www.w3.org/2001/XMLSchema#string"
            lang=""
            data-literal-node="true"
            data-say-id="1205c79b-0979-47b6-9072-aeac74dc3c21"
          >
            <div
              style="display: none"
              class="say-hidden"
              data-rdfa-container="true"
            ></div>
            <div data-content-container="true">
              ${content}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

export const articleHtml = (
  decisionUri: string,
  content: string,
  articleUri?: string,
  number?: string,
) => {
  const articleUuid = uuid();
  articleUri = articleUri ?? `http://data.lblod.info/articles/${articleUuid}`;
  return `
    <div
      data-say-render-as="structure"
      data-say-has-title="false"
      data-say-structure-type="article"
      data-say-header-format="name"
      data-say-header-tag="h5"
      data-say-number="${number}"
      data-say-romanize="false"
      data-say-is-only-article="false"
      about="${articleUri}"
      data-say-id="${articleUuid}"
      property="http://www.w3.org/ns/prov#value"
      datatype="http://www.w3.org/2001/XMLSchema#string"
      lang=""
    >
      <div
        style="display: none"
        class="say-hidden"
        data-rdfa-container="true"
      >
        <span
          about="${articleUri}"
          property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
          resource="http://data.vlaanderen.be/ns/besluit#Artikel"
        ></span
        ><span
          rev="http://data.europa.eu/eli/ontology#has_part"
          resource="${decisionUri}"
        ></span>
      </div>
      <div data-content-container="true">
        <div>
          <h5>
            <span data-say-structure-header-name="true">Artikel </span
            ><span
              style=""
              data-say-structure-header-number="true"
              property="http://data.europa.eu/eli/ontology#number"
              datatype="http://www.w3.org/2001/XMLSchema#string"
              >${number}</span
            >.
          </h5>
          <div
            property="https://say.data.gift/ns/body"
            datatype="http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral"
          >
            ${content}
          </div>
        </div>
      </div>
    </div>
  `;
};

export const mobilityRegulationWithSignals = (
  content: string,
  regulationUri = `http://data.lblod.info/mobiliteitsmaatregels/${uuid()}`,
) => `
  <div
    property="https://data.vlaanderen.be/ns/mobiliteit#heeftVerkeersmaatregel"
    typeof="https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregel"
    resource="${regulationUri}"
  >
    <span
      style="display: none"
      property="http://www.w3.org/ns/prov#wasDerivedFrom"
      resource="http://data.lblod.info/traffic-measure-concepts/61D81A60E3249100080030C9"
    ></span
    ><span
      style="display: none"
      property="http://mu.semte.ch/vocabularies/ext/zonality"
      resource="http://lblod.data.gift/concepts/b651931b-923c-477c-8da9-fc7dd841fdccZ"
    ></span
    ><span
      property="http://mu.semte.ch/vocabularies/ext/temporal"
      resource="false"
    ></span>
    <div property="http://purl.org/dc/terms/description">
      <p class="say-paragraph">${content}</p>
      <p class="say-paragraph">
        Dit wordt aangeduid door verkeerstekens:
      </p>
      <ul
        style="unordered"
        hierarchical="false"
        class="say-bullet-list"
      >
        <li class="say-list-item" data-list-marker="1. ">
          <p class="say-paragraph">
            <span
              class="say-inline-rdfa"
              about="http://data.lblod.info/verkeerstekens/2a3451ca-e601-44e7-be89-f37aa33ac191"
              data-say-id="7dd37fd2-4894-4e20-83c2-0aaa965338b5"
              ><span
                style="display: none"
                class="say-hidden"
                data-rdfa-container="true"
                ><span
                  about="http://data.lblod.info/verkeerstekens/2a3451ca-e601-44e7-be89-f37aa33ac191"
                  property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                  resource="https://data.vlaanderen.be/ns/mobiliteit#Verkeersbord-Verkeersteken"
                ></span
                ><span
                  rev="https://data.vlaanderen.be/ns/mobiliteit#wordtAangeduidDoor"
                  resource="${regulationUri}"
                ></span></span
              ><span data-content-container="true"
                ><span
                  class="say-inline-rdfa"
                  about="http://data.vlaanderen.be/id/concept/Verkeerslichtconcept/45c13c91557317dd6b7b2b37023a3825"
                  data-say-id="b5c903c9-91f1-4d72-bb63-0f3058d6fc52"
                  ><span
                    style="display: none"
                    class="say-hidden"
                    data-rdfa-container="true"
                    ><span
                      about="http://data.vlaanderen.be/id/concept/Verkeerslichtconcept/45c13c91557317dd6b7b2b37023a3825"
                      property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                      resource="https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept"
                    ></span
                    ><span
                      rev="https://data.vlaanderen.be/ns/mobiliteit#heeftVerkeersbordconcept"
                      resource="http://data.lblod.info/verkeerstekens/2a3451ca-e601-44e7-be89-f37aa33ac191"
                    ></span></span
                  ><span data-content-container="true"
                    ><span
                      class="say-inline-rdfa"
                      about="http://data.vlaanderen.be/id/concept/Verkeerslichtconcept/45c13c91557317dd6b7b2b37023a3825"
                      property="http://www.w3.org/2004/02/skos/core#prefLabel"
                      lang="nl-be"
                      data-literal-node="true"
                      data-say-id="c0c108c3-8f8b-4a13-b618-df4f5a4a3c29"
                      ><span
                        style="display: none"
                        class="say-hidden"
                        data-rdfa-container="true"
                      ></span
                      ><span data-content-container="true"
                        >VL61.1</span
                      ></span
                    ></span
                  ></span
                ></span
              ></span
            >
          </p>
        </li>
        <li class="say-list-item" data-list-marker="2. ">
          <p class="say-paragraph">
            <span
              class="say-inline-rdfa"
              about="http://data.lblod.info/verkeerstekens/e770b0d3-6883-49d8-a9b6-c508d41a51c7"
              data-say-id="82730f49-e9a2-409d-8ce2-4c7f64cfc74e"
              ><span
                style="display: none"
                class="say-hidden"
                data-rdfa-container="true"
                ><span
                  about="http://data.lblod.info/verkeerstekens/e770b0d3-6883-49d8-a9b6-c508d41a51c7"
                  property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                  resource="https://data.vlaanderen.be/ns/mobiliteit#Verkeersbord-Verkeersteken"
                ></span
                ><span
                  rev="https://data.vlaanderen.be/ns/mobiliteit#wordtAangeduidDoor"
                  resource="${regulationUri}"
                ></span></span
              ><span data-content-container="true"
                ><span
                  class="say-inline-rdfa"
                  about="http://data.vlaanderen.be/id/concept/Wegmarkeringsconcept/202b9afdd4724ae01517ab7585e18953"
                  data-say-id="b02c38a1-62a8-428a-a3e1-f2711249dbed"
                  ><span
                    style="display: none"
                    class="say-hidden"
                    data-rdfa-container="true"
                    ><span
                      about="http://data.vlaanderen.be/id/concept/Wegmarkeringsconcept/202b9afdd4724ae01517ab7585e18953"
                      property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                      resource="https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept"
                    ></span
                    ><span
                      rev="https://data.vlaanderen.be/ns/mobiliteit#heeftVerkeersbordconcept"
                      resource="http://data.lblod.info/verkeerstekens/e770b0d3-6883-49d8-a9b6-c508d41a51c7"
                    ></span></span
                  ><span data-content-container="true"
                    ><span
                      class="say-inline-rdfa"
                      about="http://data.vlaanderen.be/id/concept/Wegmarkeringsconcept/202b9afdd4724ae01517ab7585e18953"
                      property="http://www.w3.org/2004/02/skos/core#prefLabel"
                      lang="nl-be"
                      data-literal-node="true"
                      data-say-id="bd4ed058-3203-45be-8849-782186cdbab9"
                      ><span
                        style="display: none"
                        class="say-hidden"
                        data-rdfa-container="true"
                      ></span
                      ><span data-content-container="true"
                        >WM76.1</span
                      ></span
                    ></span
                  ></span
                ></span
              ></span
            >
          </p>
        </li>
      </ul>
    </div>
  </div>
`;
