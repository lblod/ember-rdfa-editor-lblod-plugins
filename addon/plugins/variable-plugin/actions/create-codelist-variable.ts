import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  MOBILITEIT,
  RDF,
  VARIABLES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

type CreateCodelistVariableArgs = {
  schema: Schema;
  value?: string;
} & CreateCodelistVariableAttrsArgs;

export function createCodelistVariable(args: CreateCodelistVariableArgs) {
  const { schema, value, label } = args;
  const attrs = createCodelistVariableAttrs(args);
  return schema.nodes.codelist.create(
    attrs,
    value
      ? schema.text(value)
      : schema.node('placeholder', {
          placeholderText: label,
        }),
  );
}

type CreateCodelistVariableAttrsArgs = {
  variable: string;
  variableInstance: string;
  label?: string;
  source?: string;
  codelist?: string;
  selectionStyle?: string;
};

export function createCodelistVariableAttrs({
  variable,
  variableInstance,
  label,
  source,
  codelist,
  selectionStyle,
}: CreateCodelistVariableAttrsArgs) {
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
      object: sayDataFactory.literal('codelist'),
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
  if (codelist) {
    properties.push({
      predicate: MOBILITEIT('codelijst').full,
      object: sayDataFactory.namedNode(codelist),
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
    selectionStyle,
  };
}
