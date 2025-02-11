import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  RDF,
  VARIABLES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

type CreateTextVariableArgs = {
  schema: Schema;
  value?: string;
} & CreateTextVariableAttrsArgs;

export function createTextVariable(args: CreateTextVariableArgs) {
  const { schema, value, label } = args;
  return schema.nodes.text_variable.create(
    createTextVariableAttrs(args),
    value
      ? schema.text(value)
      : schema.node('placeholder', {
          placeholderText: label,
        }),
  );
}

type CreateTextVariableAttrsArgs = {
  variable: string;
  variableInstance: string;
  label?: string;
};

export function createTextVariableAttrs({
  variable,
  variableInstance,
  label,
}: CreateTextVariableAttrsArgs) {
  const properties: OutgoingTriple[] = [
    {
      predicate: RDF('type').full,
      object: sayDataFactory.namedNode(VARIABLES('VariableInstance').full),
    },
    {
      predicate: VARIABLES('instanceOf').full,
      object: sayDataFactory.namedNode(variable),
    },
    {
      predicate: DCT('type').full,
      object: sayDataFactory.literal('text'),
    },
    {
      predicate: RDF('value').full,
      object: sayDataFactory.contentLiteral(),
    },
  ];
  if (label) {
    properties.push({
      predicate: DCT('title').full,
      object: sayDataFactory.literal(label),
    });
  }
  return {
    subject: variableInstance,
    rdfaNodeType: 'resource',
    properties,
  };
}
