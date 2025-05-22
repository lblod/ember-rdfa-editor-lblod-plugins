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
import { SignConcept } from '../schemas/sign-concept';
import {
  ROAD_SIGN_CATEGORIES,
  SIGN_CONCEPT_TYPES,
  SIGN_TYPE_MAPPING,
  SIGN_TYPES,
  ZONALITY_OPTIONS,
} from '../constants';
import { createTextVariable } from '../../variable-plugin/actions/create-text-variable';
import { generateVariableInstanceUri } from '../../variable-plugin/utils/variable-helpers';
import { createNumberVariable } from '../../variable-plugin/actions/create-number-variable';
import { createDateVariable } from '../../variable-plugin/actions/create-date-variable';
import { createCodelistVariable } from '../../variable-plugin/actions/create-codelist-variable';
import { createClassicLocationVariable } from '../../variable-plugin/actions/create-classic-location-variable';

interface InsertMeasureArgs {
  measureConcept: MobilityMeasureConcept;
  zonality: typeof ZONALITY_OPTIONS.ZONAL | typeof ZONALITY_OPTIONS.NON_ZONAL;
  temporal: boolean;
  variables: Record<string, Exclude<Variable, { type: 'instruction' }>>;
  templateString: string;
  decisionUri: string;
  articleUriGenerator?: () => string;
}

export default function insertMeasure({
  measureConcept,
  zonality,
  temporal,
  variables,
  templateString,
  articleUriGenerator,
  decisionUri,
}: InsertMeasureArgs): TransactionMonad<boolean> {
  return function (state: EditorState) {
    const { schema } = state;
    const signNodes = measureConcept.signConcepts.map((signConcept) =>
      constructSignNode(signConcept, schema),
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
            //TODO: not sure about this predicate...
            predicate: EXT('zonality').full,
            object: sayDataFactory.namedNode(zonality),
          },
          {
            predicate: DCT('description').full,
            object: sayDataFactory.contentLiteral(),
          },
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
  variables: Record<string, Exclude<Variable, { type: 'instruction' }>>,
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

function determineSignLabel(signConcept: SignConcept) {
  switch (signConcept.type) {
    case SIGN_CONCEPT_TYPES.TRAFFIC_LIGHT:
      return 'Verkeerslicht';
    case SIGN_CONCEPT_TYPES.ROAD_MARKING:
      return 'Wegmarkering';
    case SIGN_CONCEPT_TYPES.ROAD_SIGN:
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

function constructSignNode(signConcept: SignConcept, schema: Schema) {
  const signUri = `http://data.lblod.info/verkeerstekens/${uuid()}`;
  const prefix = determineSignLabel(signConcept);
  const node = schema.nodes.inline_rdfa.create(
    {
      rdfaNodeType: 'resource',
      subject: signUri,
      __rdfaId: uuid(),
      properties: [
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(SIGN_TYPES.TRAFFIC_SIGN),
        },
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(SIGN_TYPE_MAPPING[signConcept.type]),
        },
        {
          predicate: MOBILITEIT('heeftVerkeersbordconcept'),
          object: sayDataFactory.namedNode(signConcept.uri),
        },
      ],
    },
    schema.text(`${prefix} ${signConcept.code}`),
  );
  return node;
}

function constructVariableNode(
  variable: Exclude<Variable, { type: 'instruction' }>,
  schema: Schema,
) {
  const variableInstance = generateVariableInstanceUri();
  const args = {
    schema,
    variable: variable.uri,
    variableInstance,
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
