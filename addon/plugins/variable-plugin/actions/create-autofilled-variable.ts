import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  RDF,
  VARIABLES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

type CreateAutofilledVariableArgs = {
  schema: Schema;
  value?: string;
} & CreateAutofilledVariableAttrsArgs;

export function createAutofilledVariable(args: CreateAutofilledVariableArgs) {
  const { schema, value, label } = args;
  const attrs = createAutofilledVariableAttrs(args);
  return schema.nodes.autofilled_variable.create(
    attrs,
    value
      ? schema.text(value)
      : schema.node('placeholder', {
          placeholderText: label,
        }),
  );
}

type CreateAutofilledVariableAttrsArgs = {
  variable: string;
  variableInstance: string;
  label?: string;
  autofillKey?: string;
  convertToString?: boolean;
  initialized?: boolean;
};

export function createAutofilledVariableAttrs({
  variable,
  variableInstance,
  label,
  autofillKey,
  convertToString,
  initialized,
}: CreateAutofilledVariableAttrsArgs) {
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
      object: sayDataFactory.literal('autofilled'),
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
    autofillKey,
    convertToString,
    initialized,
  };
}
