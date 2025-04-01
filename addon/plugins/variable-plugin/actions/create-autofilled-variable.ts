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
  label?: string;
  autofillKey?: string;
  convertToString?: boolean;
  initialized?: boolean;
} & AllOrNone<{ variable: string; variableInstance: string }>;

export function createAutofilledVariableAttrs({
  variable,
  variableInstance,
  label,
  autofillKey,
  convertToString,
  initialized,
}: CreateAutofilledVariableAttrsArgs) {
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
        object: sayDataFactory.literal('autofilled'),
      },
    );
    backlinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  return {
    rdfaNodeType: 'literal',
    datatype: XSD('string').namedNode,
    backlinks,
    label,
    externalTriples,
    autofillKey,
    convertToString,
    initialized,
  };
}
