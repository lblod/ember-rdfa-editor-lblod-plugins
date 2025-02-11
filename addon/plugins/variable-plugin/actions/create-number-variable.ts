import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  RDF,
  VARIABLES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

type CreateNumberVariableArgs = {
  schema: Schema;
} & CreateNumberVariableAttrsArgs;

export function createNumberVariable(args: CreateNumberVariableArgs) {
  const { schema } = args;
  const attrs = createNumberVariableAttrs(args);
  return schema.nodes.number.create(attrs);
}

type CreateNumberVariableAttrsArgs = {
  variable: string;
  variableInstance: string;
  label?: string;
  value?: string;
  minimumValue?: number;
  maximumValue?: number;
  writtenNumber?: boolean;
};

export function createNumberVariableAttrs({
  variable,
  variableInstance,
  label,
  value,
  minimumValue,
  maximumValue,
  writtenNumber = false,
}: CreateNumberVariableAttrsArgs) {
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
      object: sayDataFactory.literal('number'),
    },
  ];
  if (label) {
    properties.push({
      predicate: DCT('title').full,
      object: sayDataFactory.literal(label),
    });
  }
  if (value) {
    properties.push({
      predicate: RDF('value').full,
      object: sayDataFactory.literal(value),
    });
  }
  return {
    subject: variableInstance,
    rdfaNodeType: 'resource',
    properties,
    minimumValue,
    maximumValue,
    writtenNumber,
  };
}
