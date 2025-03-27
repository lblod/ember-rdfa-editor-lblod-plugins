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
  label?: string;
  source?: string;
} & AllOrNone<{ variable: string; variableInstance: string }>;

export function createClassicLocationVariableAttrs({
  variable,
  variableInstance,
  label,
  source,
}: CreateClassicLocationVariableAttrsArgs) {
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
        object: sayDataFactory.literal('codelist'),
      },
    );
    if (source) {
      externalTriples.push({
        subject: sayDataFactory.namedNode(variableInstance),
        predicate: DCT('source').full,
        object: sayDataFactory.namedNode(source),
      });
    }
    backlinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  return {
    rdfaNodeType: 'literal',
    datatype: XSD('string').namedNode,
    externalTriples,
    backlinks,
    label,
    source,
  };
}
