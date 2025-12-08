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

type CreateCodelistVariableArgs = {
  schema: Schema;
} & CreateCodelistVariableAttrsArgs;

export function createCodelistVariable(args: CreateCodelistVariableArgs) {
  const { schema } = args;
  const attrs = createCodelistVariableAttrs(args);
  return schema.nodes.codelist.create(attrs);
}

type CreateCodelistVariableAttrsArgs = {
  selectionStyle?: 'single' | 'multi';
  label?: string;
  source: string;
  codelist: string;
  variable?: string;
};

export function createCodelistVariableAttrs({
  selectionStyle,
  label,
  source,
  codelist,
  variable,
}: CreateCodelistVariableAttrsArgs) {
  return {
    selectionStyle,
    source,
    codelist,
    label,
    variable,
  };
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
} & AllOrNone<{ variable: string; variableInstance: string }>;

function createCodelistOptionNodeAttrs({
  subject,
  text,
  variable,
  variableInstance,
}: CreateCodelistOptionNodeAttrsArgs) {
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
    externalTriples,
    properties,
    backlinks,
  };
}
