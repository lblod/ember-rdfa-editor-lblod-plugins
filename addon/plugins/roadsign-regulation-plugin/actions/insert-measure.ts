import { EditorState, Fragment, PNode, Schema } from '@lblod/ember-rdfa-editor';
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
import { SIGN_TYPE_MAPPING, SIGN_TYPES, ZONALITY_OPTIONS } from '../constants';

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
    const { transaction, result } = transactionCombinator(state)([
      insertArticle({ node: articleNode, decisionUri }),
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
  const parts = templateString.split(/(\$\{.+\})/);
  const nodes = [];
  for (const part of parts) {
    if (!part) {
      continue;
    }
    const match = /^\$\{(.+)\}$/.exec(part);
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

function constructSignNode(signConcept: SignConcept, schema: Schema) {
  const signUri = `http://data.lblod.info/verkeerstekens/${uuid()}`;

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
    schema.text(signConcept.code),
  );
  return node;
}

function constructVariableNode(
  variable: Exclude<Variable, { type: 'instruction' }>,
  schema: Schema,
) {
  switch (variable.type) {
    case 'text':
      return constructTextVariableNode(variable, schema);
    case 'number':
      return constructNumberVariableNode(variable, schema);
    case 'date':
      return constructDateVariableNode(variable, schema);
    case 'codelist':
      return constructCodelistVariableNode(variable, schema);
    case 'location':
      return constructLocationVariableNode(variable, schema);
  }
}

function constructTextVariableNode(
  variable: Extract<Variable, { type: 'text' }>,
  schema: Schema,
) {
  return schema.nodes.placeholder.create({
    placeholderText: variable.label,
  });
  return schema.nodes.text_variable.create();
}

function constructNumberVariableNode(
  variable: Extract<Variable, { type: 'number' }>,
  schema: Schema,
) {
  return schema.nodes.placeholder.create({
    placeholderText: variable.label,
  });
  return schema.nodes.number.create();
}

function constructDateVariableNode(
  variable: Extract<Variable, { type: 'date' }>,
  schema: Schema,
) {
  return schema.nodes.placeholder.create({
    placeholderText: variable.label,
  });
  return schema.nodes.date.create();
}

function constructCodelistVariableNode(
  variable: Extract<Variable, { type: 'codelist' }>,
  schema: Schema,
) {
  return schema.nodes.placeholder.create({
    placeholderText: variable.label,
  });
  return schema.nodes.codelist.create();
}

function constructLocationVariableNode(
  variable: Extract<Variable, { type: 'location' }>,
  schema: Schema,
) {
  return schema.nodes.placeholder.create({
    placeholderText: variable.label,
  });
  return schema.nodes.location.create();
}
