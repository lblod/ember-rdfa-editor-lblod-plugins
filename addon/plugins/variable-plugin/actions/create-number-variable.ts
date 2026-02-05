import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  RDF,
  VARIABLES,
  XSD,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { AllOrNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/types';
import {
  FullTriple,
  IncomingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
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
  value?: string;
  minimumValue?: number;
  maximumValue?: number;
  writtenNumber?: boolean;
  label?: string;
} & AllOrNone<{
  variable: string;
  variableInstance: string;
  __rdfaId?: string;
}>;

export function createNumberVariableAttrs({
  variable,
  variableInstance,
  __rdfaId,
  label,
  value,
  minimumValue,
  maximumValue,
  writtenNumber = false,
}: CreateNumberVariableAttrsArgs) {
  const externalTriples: FullTriple[] = [];
  const backlinks: IncomingTriple[] = [];
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
        object: sayDataFactory.literal('number'),
      },
    );
    backlinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  return {
    rdfaNodeType: 'literal',
    datatype: XSD('number').namedNode,
    label,
    externalTriples,
    __rdfaId,
    backlinks,
    content: value,
    minimumValue,
    maximumValue,
    writtenNumber,
  };
}
