import { module, test } from 'qunit';
import { PNode } from '@lblod/ember-rdfa-editor';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  ELI,
  MOBILITEIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { findNodesBySubject } from '@lblod/ember-rdfa-editor/plugins/rdfa-info/utils';
import {
  SAMPLE_PLUGINS,
  SAMPLE_SCHEMA,
  testEditor,
} from 'dummy/tests/utils/editor';
import {
  articleHtml,
  decisionDoc,
  mobilityRegulationWithSignals,
} from 'dummy/tests/helpers/test-documents';
import {
  findNodesOfType,
  getFirstTripleLinkedNodes,
  getLinkedNodes,
} from 'dummy/tests/helpers/node-utils';

module('plugin | variable plugin', function () {
  test('it should parse older codelists which lack a URI', function (assert) {
    const DECISION_URI = 'http://data.lblod.info/id/besluiten/12345678';
    const CODELIST_VAR_URI =
      'http://data.lblod.info/variables/b22143dd-e115-4038-bff2-0a23642dcd02';
    const { controller } = testEditor(SAMPLE_SCHEMA, SAMPLE_PLUGINS);
    const htmlContent = decisionDoc(
      DECISION_URI,
      articleHtml(
        DECISION_URI,
        mobilityRegulationWithSignals(`
      <p class="say-paragraph">
        <span
          about="http://data.lblod.info/variables/38592547-0fda-4530-8699-b64044c7b5b1"
          data-say-id="7738eeb8-5ea7-418f-8c84-8e3a346c56d8"
          property="http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
          datatype="http://www.w3.org/2001/XMLSchema#string"
          lang=""
          ><span
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
            ><span
              about="http://data.lblod.info/variables/38592547-0fda-4530-8699-b64044c7b5b1"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="http://lblod.data.gift/vocabularies/variables/VariableInstance"
            ></span
            ><span
              about="http://data.lblod.info/variables/38592547-0fda-4530-8699-b64044c7b5b1"
              property="http://lblod.data.gift/vocabularies/variables/instanceOf"
              resource="http://data.lblod.info/mappings/61D81A62E3249100080030CE"
            ></span
            ><span
              property="http://purl.org/dc/terms/type"
              content="location"
              datatype="http://www.w3.org/2001/XMLSchema#string"
            ></span></span
          ><span data-content-container="true"
            >Op het kruispunt van de Dendermondsesteenweg met
            het Heernisplein;<br class="say-hard-break" />op
            het kruispunt van de Dendermondsesteenweg met de
            Louis Schuermanstraat;<br
              class="say-hard-break"
            />op het kruispunt van de Dendermondsesteenweg met
            de Gentbruggestraat;<br
              class="say-hard-break"
            />op het kruispunt van de Dendermondsesteenweg met
            de Cécile Cautermanstraat en de Adolf
            Baeyensstraat geldt:</span
          ></span
        >
        de bestuurders moeten de lichten van de driekleurige
        verkeerslichten naleven; de plaats waar de bestuurders
        moeten stoppen ingevolge
        <span
          about="${CODELIST_VAR_URI}"
          data-say-id="c8fe5e20-07e4-440e-8a70-6f28b79c62d4"
          property="http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
          datatype="http://www.w3.org/2001/XMLSchema#string"
          lang=""
          ><span
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
            ><span
              about="${CODELIST_VAR_URI}"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="http://lblod.data.gift/vocabularies/variables/VariableInstance"
            ></span
            ><span
              about="${CODELIST_VAR_URI}"
              property="http://lblod.data.gift/vocabularies/variables/instanceOf"
              resource="http://data.lblod.info/mappings/619D09E8B48EDB000B00002B"
            ></span
            ><span
              property="http://purl.org/dc/terms/type"
              content="codelist"
              datatype="http://www.w3.org/2001/XMLSchema#string"
            ></span></span
          ><span data-content-container="true"
            >het verkeerslicht</span
          ></span
        >
        wordt aangeduid.
      </p>
    `),
      ),
    );
    controller.initialize(htmlContent);
    const { doc } = controller.mainEditorState;

    const codelistNode: PNode | undefined = findNodesOfType(doc, 'codelist')[0];
    assert.ok(codelistNode, 'should contain codelist node');
    assert.strictEqual(codelistNode?.attrs?.codelist, 'UNKNOWN');
  });

  test('it should parse codelists and locations correctly', function (assert) {
    const DECISION_URI = 'http://data.lblod.info/id/besluiten/12345678';
    const CODELIST_URI = 'http://lblod.data.gift/concept-schemes/987654321';
    const { controller } = testEditor(SAMPLE_SCHEMA, SAMPLE_PLUGINS);
    const htmlContent = decisionDoc(
      DECISION_URI,
      articleHtml(
        DECISION_URI,
        mobilityRegulationWithSignals(`
      <p class="say-paragraph">
        <span
          about="http://data.lblod.info/variable-instances/08a864c5-79dd-4129-b8f7-36d1339b0c0c"
          data-say-id="c50085b9-392d-46a1-b4c1-65c25a3fbdec"
          property="http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
          datatype="http://www.w3.org/2001/XMLSchema#string"
          lang=""
          ><span
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
            ><span
              about="http://data.lblod.info/variable-instances/08a864c5-79dd-4129-b8f7-36d1339b0c0c"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="http://lblod.data.gift/vocabularies/variables/VariableInstance"
            ></span
            ><span
              about="http://data.lblod.info/variable-instances/08a864c5-79dd-4129-b8f7-36d1339b0c0c"
              property="http://lblod.data.gift/vocabularies/variables/instanceOf"
              resource="http://data.lblod.info/mappings/61D59925E324910008002B01"
            ></span
            ><span
              property="http://purl.org/dc/terms/type"
              content="location"
              datatype="http://www.w3.org/2001/XMLSchema#string"
            ></span
            ><span
              property="http://purl.org/dc/terms/title"
              content="locatie"
              datatype="http://www.w3.org/2001/XMLSchema#string"
            ></span
            ><span
              about="http://data.lblod.info/variable-instances/08a864c5-79dd-4129-b8f7-36d1339b0c0c"
              property="http://purl.org/dc/terms/source"
              resource="https://register.mobiliteit.vlaanderen.be/sparql"
            ></span></span
          ><span data-content-container="true"
            >Op de Dendermondsesteenweg vanaf huisnummer 242A
            tot en met 244 geldt:</span
          ></span
        >
        het parkeren is verboden; de maatregel geldt
        <span
          about="http://data.lblod.info/variable-instances/46a3629b-e369-497f-be77-f570ceb999c5"
          data-say-id="8a01da30-06c5-45ec-bf08-87c4425545a1"
          property="http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
          datatype="http://www.w3.org/2001/XMLSchema#string"
          lang=""
          ><span
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
            ><span
              about="http://data.lblod.info/variable-instances/46a3629b-e369-497f-be77-f570ceb999c5"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="http://lblod.data.gift/vocabularies/variables/VariableInstance"
            ></span
            ><span
              about="http://data.lblod.info/variable-instances/46a3629b-e369-497f-be77-f570ceb999c5"
              property="http://lblod.data.gift/vocabularies/variables/instanceOf"
              resource="http://data.lblod.info/mappings/61AE0EF3BF5C750009000033"
            ></span
            ><span
              property="http://purl.org/dc/terms/type"
              content="codelist"
              datatype="http://www.w3.org/2001/XMLSchema#string"
            ></span
            ><span
              property="http://purl.org/dc/terms/title"
              content="tijdens_dit_tijdsvenster"
              datatype="http://www.w3.org/2001/XMLSchema#string"
            ></span
            ><span
              about="http://data.lblod.info/variable-instances/46a3629b-e369-497f-be77-f570ceb999c5"
              property="https://data.vlaanderen.be/ns/mobiliteit#codelijst"
              resource="${CODELIST_URI}"
            ></span
            ><span
              about="http://data.lblod.info/variable-instances/46a3629b-e369-497f-be77-f570ceb999c5"
              property="http://purl.org/dc/terms/source"
              resource="https://register.mobiliteit.vlaanderen.be/sparql"
            ></span></span
          ><span data-content-container="true"
            >van 8 tot 20u. Van maandag tot en met
            zaterdag</span
          ></span
        >; het begin van de parkeerreglementering wordt
        aangeduid.
      </p>
`),
      ),
    );
    controller.initialize(htmlContent);
    const { doc } = controller.mainEditorState;
    const codelistNode: PNode | undefined = findNodesOfType(doc, 'codelist')[0];
    assert.ok(codelistNode, 'should contain codelist node');
    assert.strictEqual(codelistNode?.attrs?.codelist, CODELIST_URI);
  });

  test('it should parse older location variables using the `ext:Mapping` type, lacking a `source` attribute', function (assert) {
    const { controller } = testEditor(SAMPLE_SCHEMA, SAMPLE_PLUGINS);
    const htmlContent = `
    <div lang="nl-BE" data-say-document="true">
      <span
        resource="http://data.lblod.info/mappings/123456"
        typeof="ext:Mapping"
      >
        <span
          property="http://mu.semte.ch/vocabularies/ext/instance"
          resource="http://data.lblod.info/variable-instance/123456"
        >
        </span>
        <span property="dct:type" content="location">
        </span>
        <span property="ext:content">
          Content
        </span>
      </span>
    </div>
    `;
    controller.initialize(htmlContent);
    const locationNode: PNode | undefined = findNodesOfType(
      controller.mainEditorState.doc,
      'location',
    )[0];
    assert.strictEqual(locationNode.attrs['source'], '');
  });

  test('it should parse older codelist variables using the `ext:Mapping` type, lacking a `source` or `codelist` attribute', function (assert) {
    const { controller } = testEditor(SAMPLE_SCHEMA, SAMPLE_PLUGINS);
    const htmlContent = `
      <span
        about="http://data.lblod.info/mappings/123456"
        property="http://mu.semte.ch/vocabularies/ext/content"
        datatype="http://www.w3.org/2001/XMLSchema#string"
        lang=""
      >
        <span
          style="display: none"
          data-rdfa-container="true"
        >
          <span
            about="http://data.lblod.info/mappings/123456"
            property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            resource="http://mu.semte.ch/vocabularies/ext/Mapping"
          >
          </span>
          <span
            about="http://data.lblod.info/mappings/123456"
            property="http://mu.semte.ch/vocabularies/ext/instance"
            resource="http://data.lblod.info/variable-instance/123456"
          >
          </span>
          <span
            property="http://purl.org/dc/terms/type"
            content="codelist"
            datatype="http://www.w3.org/2001/XMLSchema#string"
          >
          </span>
        </span>
        <span
          data-content-container="true"
        >
          codelist content
        </span>
      </span>
    `;
    controller.initialize(htmlContent);
    const codelistNode: PNode | undefined = findNodesOfType(
      controller.mainEditorState.doc,
      'codelist',
    )[0];
    assert.strictEqual(codelistNode.attrs['source'], 'UNKNOWN');
    assert.strictEqual(codelistNode.attrs['codelist'], 'UNKNOWN');
  });

  test('should link mobility regulations with decisions when parsing', function (assert) {
    const DECISION_URI = 'http://data.lblod.info/id/besluiten/12345678';
    const REGULATION_URI =
      'http://data.lblod.info/mobiliteitsmaatregels/1234567890';
    const { controller } = testEditor(SAMPLE_SCHEMA, SAMPLE_PLUGINS);
    const htmlContent = decisionDoc(
      DECISION_URI,
      articleHtml(
        DECISION_URI,
        mobilityRegulationWithSignals(
          '<p>Some kind of regulation</p>',
          REGULATION_URI,
        ),
      ),
    );
    controller.initialize(htmlContent);
    const { doc } = controller.mainEditorState;
    const decisionNode = findNodesBySubject(doc, DECISION_URI)[0]?.value;

    const [articleLink, articleNodes] = getFirstTripleLinkedNodes(
      doc,
      decisionNode,
      ELI('has_part'),
    );
    assert.ok(articleLink, 'should link to article from decision');
    const articleNode = articleNodes?.[0];
    assert.ok(articleNode, 'should link to article node from decision');

    const [measureTriple, measureNodes] = getFirstTripleLinkedNodes(
      doc,
      articleNode,
      MOBILITEIT('heeftVerkeersmaatregel'),
    );
    assert.ok(measureTriple, 'should link to measure from article');
    const measureNode = measureNodes?.[0];
    assert.true(
      hasOutgoingNamedNodeTriple(
        measureNode.attrs,
        RDF('type'),
        MOBILITEIT('Mobiliteitsmaatregel'),
      ),
      'has correct measure type',
    );
    assert.strictEqual(measureNode.attrs['subject'], REGULATION_URI);

    const linkedSignals = getLinkedNodes(
      doc,
      measureNode,
      MOBILITEIT('wordtAangeduidDoor'),
    );
    assert.strictEqual(
      linkedSignals.size,
      2,
      'measure should have 2 linked signals',
    );
    const signalTypes = [...linkedSignals.values()].map(([sigNode]) =>
      getOutgoingTriple(sigNode.attrs, RDF('type')),
    );
    // TODO these are actually old and should ideally be updated...
    // See https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/597
    assert.deepEqual(
      signalTypes[0]?.object,
      MOBILITEIT('Verkeersbord-Verkeersteken').namedNode,
    );
    assert.deepEqual(
      signalTypes[1]?.object,
      MOBILITEIT('Verkeersbord-Verkeersteken').namedNode,
    );
  });
});
