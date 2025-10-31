import {
  EditorState,
  Fragment,
  PNode,
  Schema,
  Selection,
} from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import { addPropertyToNode } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import {
  DCT,
  EXT,
  MOBILITEIT,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  transactionCombinator,
  TransactionMonad,
} from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { MobilityMeasureConcept } from '../schemas/mobility-measure-concept';
import { Variable } from '../schemas/variable';
import { buildArticleStructure } from '../../decision-plugin/utils/build-article-structure';
import { insertArticle } from '../../decision-plugin/actions/insert-article';
import { TrafficSignalConcept } from '../schemas/traffic-signal-concept';
import {
  ROAD_SIGN_CATEGORIES,
  TRAFFIC_SIGNAL_CONCEPT_TYPES,
  TRAFFIC_SIGNAL_TYPE_MAPPING,
  TRAFFIC_SIGNAL_TYPES,
  ZONALITY_OPTIONS,
  ZonalOrNot,
} from '../constants';
import { createTextVariable } from '../../variable-plugin/actions/create-text-variable';
import { generateVariableInstanceUri } from '../../variable-plugin/utils/variable-helpers';
import { createNumberVariable } from '../../variable-plugin/actions/create-number-variable';
import { createDateVariable } from '../../variable-plugin/actions/create-date-variable';
import { createCodelistVariable } from '../../variable-plugin/actions/create-codelist-variable';
import { createClassicLocationVariable } from '../../variable-plugin/actions/create-classic-location-variable';
import { isTrafficSignal, TrafficSignal } from '../schemas/traffic-signal';
import {
  isMobilityMeasurePreview,
  MobilityMeasurePreview,
} from '../schemas/mobility-measure-preview';
import {
  isVariableInstance,
  VariableInstance,
} from '../schemas/variable-instance';

interface InsertMeasureArgs {
  measureConceptOrPreview: MobilityMeasureConcept | MobilityMeasurePreview;
  zonality: ZonalOrNot;
  temporal: boolean;
  variables: Record<
    string,
    Exclude<Variable, { type: 'instruction' }> | VariableInstance
  >;
  templateString: string;
  decisionUri: string;
  articleUriGenerator?: () => string;
}

export default function insertMeasure({
  measureConceptOrPreview,
  zonality,
  temporal,
  variables,
  templateString,
  articleUriGenerator,
  decisionUri,
}: InsertMeasureArgs): TransactionMonad<boolean> {
  return function (state: EditorState) {
    const measureConcept = isMobilityMeasurePreview(measureConceptOrPreview)
      ? measureConceptOrPreview.measureConcept
      : measureConceptOrPreview;
    const measurePreview =
      isMobilityMeasurePreview(measureConceptOrPreview) &&
      measureConceptOrPreview;
    const { schema } = state;
    const signNodes = measureConcept.trafficSignalConcepts.map((signConcept) =>
      constructSignalNode(signConcept, schema, zonality),
    );
    let signSection: PNode[] = [];
    if (signNodes.length) {
      const signList = schema.nodes.bullet_list.create(
        {},
        signNodes.map((signNode) =>
          schema.nodes.list_item.create(
            {},
            schema.nodes.paragraph.create({}, signNode),
          ),
        ),
      );
      signSection = [
        schema.nodes.paragraph.create(
          {},
          schema.text('Dit wordt aangeduid door verkeerstekens:'),
        ),
        signList,
      ];
    }
    const measureBody = constructMeasureBody(templateString, variables, schema);
    const temporalNode = temporal
      ? schema.nodes.paragraph.create(
          {},
          schema.text('Deze signalisatie is dynamisch.'),
        )
      : undefined;
    const measureUri = `http://data.lblod.info/mobiliteitsmaatregels/${uuid()}`;
    const measureNode = schema.nodes.block_rdfa.create(
      {
        rdfaNodeType: 'resource',
        subject: measureUri,
        __rdfaId: uuid(),
        label: `Mobiliteitsmaatregel ${measureConcept.label}`,
        properties: [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(
              MOBILITEIT('Mobiliteitsmaatregel').full,
            ),
          },
          {
            predicate: PROV('wasDerivedFrom').full,
            object: sayDataFactory.namedNode(measureConcept.uri),
          },
          {
            // TODO this should be replaced by MOBILITEIT('zone'), but we need to know what to
            // actually link this to as we have no way to specify zones
            predicate: EXT('zonality').full,
            object: sayDataFactory.namedNode(zonality),
          },
          {
            predicate: DCT('description').full,
            object: sayDataFactory.contentLiteral('nl-BE'),
          },
          ...(measurePreview
            ? [
                {
                  predicate: MOBILITEIT('isGebaseerdOpMaatregelOntwerp'),
                  object: sayDataFactory.namedNode(measurePreview.uri),
                },
              ]
            : []),
          // TODO there are some properties that are missing from the measure that we should define if we can:
          // locn:address, mobiliteit:contactorganisatie, mobiliteit:doelgroep, adms:identifier,
          // mobiliteit:periode, mobiliteit:plaatsbepaling, schema:eventSchedule, mobiliteit:type,
          // mobiliteit:verwijstNaar, mobiliteit:heeftGevolg
        ],
      },
      [measureBody, ...signSection, ...(temporalNode ? [temporalNode] : [])],
    );
    const articleNode = buildArticleStructure(
      state.schema,
      articleUriGenerator,
    ).copy(Fragment.from(measureNode));
    const initialTransaction = insertArticle({
      node: articleNode,
      decisionUri,
    })(state).transaction;
    const resultingSelection = initialTransaction.selection;
    const { transaction, result } = transactionCombinator(
      state,
      initialTransaction,
    )([
      addPropertyToNode({
        resource: articleNode.attrs.subject as string,
        property: {
          predicate: MOBILITEIT('heeftVerkeersmaatregel').full,
          object: sayDataFactory.resourceNode(
            measureNode.attrs.subject as string,
          ),
        },
      }),
      ...signNodes.map((signNode) =>
        addPropertyToNode({
          resource: measureNode.attrs.subject as string,
          property: {
            predicate: MOBILITEIT('wordtAangeduidDoor').full,
            object: sayDataFactory.resourceNode(
              signNode.attrs.subject as string,
            ),
          },
        }),
      ),
    ]);
    transaction.setSelection(
      Selection.fromJSON(transaction.doc, resultingSelection.toJSON()),
    );
    return {
      initialState: state,
      transaction,
      result: result.every(Boolean),
    };
  };
}

function constructMeasureBody(
  templateString: string,
  variables: Record<
    string,
    Exclude<Variable, { type: 'instruction' }> | VariableInstance
  >,
  schema: Schema,
) {
  const parts = templateString.split(/(\$\{[^{}$]+\})/);
  const nodes = [];
  for (const part of parts) {
    if (!part) {
      continue;
    }
    const match = /^\$\{([^{}$]+)\}$/.exec(part);
    if (match) {
      const variableName = match[1];
      const matchedVariable = variables[variableName];
      if (matchedVariable) {
        nodes.push(constructVariableNode(matchedVariable, schema));
      } else {
        nodes.push(schema.text(part));
      }
    } else {
      nodes.push(schema.text(part));
    }
  }
  return schema.nodes.paragraph.create({}, nodes);
}

function determineSignLabel(signConcept: TrafficSignalConcept) {
  switch (signConcept.type) {
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT:
      return 'Verkeerslicht';
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING:
      return 'Wegmarkering';
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN:
      if (
        signConcept.categories
          .map((cat) => cat.uri)
          .includes(ROAD_SIGN_CATEGORIES.ONDERBORD)
      ) {
        return 'Onderbord';
      } else {
        return 'Verkeersbord';
      }
  }
}

function constructSignalNode(
  signalOrSignalConcept: TrafficSignal | TrafficSignalConcept,
  schema: Schema,
  zonality?: ZonalOrNot,
) {
  const signalConcept = isTrafficSignal(signalOrSignalConcept)
    ? signalOrSignalConcept.trafficSignalConcept
    : signalOrSignalConcept;
  const signalUri = isTrafficSignal(signalOrSignalConcept)
    ? signalOrSignalConcept.uri
    : `http://data.lblod.info/verkeerstekens/${uuid()}`;
  const prefix = determineSignLabel(signalConcept);
  const zonalityText =
    !zonality || zonality !== ZONALITY_OPTIONS.ZONAL
      ? ''
      : prefix === 'Onderbord'
        ? ' op het verkeersbord met zonale geldigheid'
        : ' met zonale geldigheid';
  const node = schema.nodes.inline_rdfa.create(
    {
      rdfaNodeType: 'resource',
      subject: signalUri,
      __rdfaId: uuid(),
      properties: [
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(TRAFFIC_SIGNAL_TYPES.TRAFFIC_SIGNAL),
        },
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(
            TRAFFIC_SIGNAL_TYPE_MAPPING[signalConcept.type],
          ),
        },
        {
          predicate: PROV('wasDerivedFrom').full,
          object: sayDataFactory.namedNode(signalOrSignalConcept.uri),
        },
        // TODO should include extra Verkeersteken properties? mobiliteit:heeftOnderbord,
        // mobiliteit:isBeginZone, mobiliteit:isEindeZone?
      ],
    },
    schema.text(
      `${prefix} ${signalConcept.regulatoryNotation || signalConcept.code}${zonalityText}`,
    ),
  );
  return node;
}

function constructVariableNode(
  variableOrVariableInstance:
    | Exclude<Variable, { type: 'instruction' }>
    | VariableInstance,
  schema: Schema,
) {
  const variable = isVariableInstance(variableOrVariableInstance)
    ? variableOrVariableInstance.variable
    : variableOrVariableInstance;
  const variableInstance = isVariableInstance(variableOrVariableInstance)
    ? variableOrVariableInstance
    : {
        uri: generateVariableInstanceUri(),
        value: undefined,
      };
  const valueStr =
    variableInstance.value instanceof Date
      ? variableInstance.value.toISOString()
      : variableInstance.value?.toString();
  const args = {
    schema,
    variable: variable.uri,
    variableInstance: variableInstance.uri,
    value: valueStr,
    label: variable.label,
  };
  switch (variable.type) {
    case 'text':
      return createTextVariable(args);
    case 'number':
      return createNumberVariable(args);
    case 'date':
      return createDateVariable(args);
    case 'codelist':
      return createCodelistVariable({
        ...args,
        source: variable.source,
        codelist: variable.codelistUri,
      });
    case 'location':
      return createClassicLocationVariable({
        ...args,
        source: variable.source,
      });
  }
}
