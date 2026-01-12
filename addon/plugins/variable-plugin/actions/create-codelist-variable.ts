import { Schema } from '@lblod/ember-rdfa-editor';
import {
  DCT,
  RDF,
  SKOS,
  VARIABLES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { AllOrNone } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/types';
import {
  FullTriple,
  IncomingTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { CodelistAttrs } from '../variables';
import { CodeListOption } from '../utils/fetch-data';

type CreateCodelistVariableArgs = {
  schema: Schema;
  value?: string;
  valueLabel?: string;
} & CreateCodelistVariableAttrsArgs;

export function createCodelistVariable(args: CreateCodelistVariableArgs) {
  const { schema } = args;
  const attrs = createCodelistVariableAttrs(args);
  if (args.value && args.valueLabel) {
    const codelistOption = createCodelistOptionNode({
      schema,
      subject: args.value,
      variableInstance: args.variableInstance,
      text: args.valueLabel,
    });
    return schema.nodes.codelist.create(attrs, [codelistOption]);
  }
  return schema.nodes.codelist.create(attrs);
}

type CreateCodelistVariableAttrsArgs = {
  selectionStyle?: 'single' | 'multi';
  label?: string;
  source: string;
  codelist: string;
  hardcodedOptionList?: CodeListOption[];
} & AllOrNone<{ variable: string; variableInstance: string }>;

export function createCodelistVariableAttrs({
  selectionStyle,
  label,
  source,
  codelist,
  variable,
  variableInstance,
  hardcodedOptionList,
}: CreateCodelistVariableAttrsArgs) {
  const externalTriples: FullTriple[] = [];
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
  }

  return {
    rdfaNodeType: 'literal',
    externalTriples,
    selectionStyle,
    source,
    codelist,
    label,
    variable,
    variableInstance,
    hardcodedOptionList,
  } as CodelistAttrs;
}

type CreateCodelistOptionNodeArgs = {
  schema: Schema;
  text: string;
} & CreateCodelistOptionNodeAttrsArgs;

export function createCodelistOptionNode(args: CreateCodelistOptionNodeArgs) {
  const { schema, text } = args;
  const attrs = createCodelistOptionNodeAttrs(args);
  return schema.nodes.codelist_option.create(attrs, schema.text(text));
}

type CreateCodelistOptionNodeAttrsArgs = {
  subject: string;
  text: string;
  value?: string;
  variableInstance?: string;
};

function createCodelistOptionNodeAttrs({
  subject,
  text,
  variableInstance,
}: CreateCodelistOptionNodeAttrsArgs) {
  const backlinks: IncomingTriple[] = [];
  if (variableInstance) {
    backlinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  const properties: OutgoingTriple[] = [
    {
      predicate: SKOS('prefLabel').full,
      object: sayDataFactory.literal(text),
    },
  ];

  return {
    rdfaNodeType: 'resource',
    subject,
    properties,
    backlinks,
  };
}
