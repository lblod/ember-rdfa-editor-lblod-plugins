import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  RDF,
  VARIABLES,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { AllOrNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/types';
import { IncomingLiteralNodeTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
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

type CreateTextVariableAttrsArgs = { label?: string } & AllOrNone<{
  variable: string;
  variableInstance: string;
}>;

export function createTextVariableAttrs({
  label,
  variable,
  variableInstance,
}: CreateTextVariableAttrsArgs) {
  const externalTriples: FullTriple[] = [];
  const backlinks: IncomingLiteralNodeTriple[] = [];
  if (variable) {
    externalTriples.push(
      {
        subject: sayDataFactory.namedNode(variableInstance),
        predicate: RDF('type').full,
        object: sayDataFactory.namedNode(VARIABLES('VariableInstance').full),
      },
      {
        subject: sayDataFactory.namedNode(variableInstance),
        predicate: VARIABLES('instanceOf').full,
        object: sayDataFactory.namedNode(variable),
      },
      {
        subject: sayDataFactory.namedNode(variableInstance),
        predicate: DCT('type').full,
        object: sayDataFactory.literal('text'),
      },
    );
    backlinks.push({
      subject: sayDataFactory.literalNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  return {
    rdfaNodeType: 'literal',
    datatype: XSD('string').full,
    label,
    backlinks,
    externalTriples,
  };
}
