import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  RDF,
  VARIABLES,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

type CreateDateVariableArgs = {
  schema: Schema;
} & CreateDateVariableAttrsArgs;

export function createDateVariable(args: CreateDateVariableArgs) {
  const { schema } = args;
  const attrs = createDateVariableAttrs(args);
  return schema.nodes.date.create(attrs);
}

type CreateDateVariableAttrsArgs = {
  variable: string;
  variableInstance: string;
  label?: string;
  value?: string;
  onlyDate?: boolean;
  format?: string;
  custom?: boolean;
  customAllowed?: boolean;
};

export function createDateVariableAttrs({
  variable,
  variableInstance,
  label,
  value,
  onlyDate,
  format,
  custom,
  customAllowed,
}: CreateDateVariableAttrsArgs) {
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
      object: sayDataFactory.literal('date'),
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
      object: sayDataFactory.literal(
        value,
        onlyDate ? XSD('date').namedNode : XSD('dateTime').namedNode,
      ),
    });
  }
  return {
    subject: variableInstance,
    rdfaNodeType: 'resource',
    properties,
    onlyDate,
    format,
    customAllowed,
    custom,
  };
}
