import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  RDF,
  VARIABLES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

type CreateClassicLocationVariableArgs = {
  schema: Schema;
  value?: string;
} & CreateClassicLocationVariableAttrsArgs;

export function createClassicLocationVariable(
  args: CreateClassicLocationVariableArgs,
) {
  const { schema, value, label } = args;
  const attrs = createClassicLocationVariableAttrs(args);
  return schema.nodes.location.create(
    attrs,
    value
      ? schema.text(value)
      : schema.node('placeholder', {
          placeholderText: label,
        }),
  );
}

type CreateClassicLocationVariableAttrsArgs = {
  variable: string;
  variableInstance: string;
  label?: string;
  source?: string;
};

export function createClassicLocationVariableAttrs({
  variable,
  variableInstance,
  label,
  source,
}: CreateClassicLocationVariableAttrsArgs) {
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
      object: sayDataFactory.literal('location'),
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
  if (source) {
    properties.push({
      predicate: DCT('source').full,
      object: sayDataFactory.namedNode(source),
    });
  }
  return {
    subject: variableInstance,
    rdfaNodeType: 'resource',
    properties,
  };
}
