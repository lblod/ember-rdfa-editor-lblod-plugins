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
  IncomingLiteralNodeTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { formatContainsTime } from '../utils/date-helpers';

type CreateDateVariableArgs = {
  schema: Schema;
} & CreateDateVariableAttrsArgs;

export function createDateVariable(args: CreateDateVariableArgs) {
  const { schema } = args;
  const attrs = createDateVariableAttrs(args);
  return schema.nodes.date.create(attrs);
}

type CreateDateVariableAttrsArgs = {
  label?: string;
  value?: string;
  /** @deprecated the `onlyDate` attribute is no longer used. It has been superseded by the usage of `format` and `datatype` */
  onlyDate?: boolean;
  format?: string;
  custom?: boolean;
  customAllowed?: boolean;
} & AllOrNone<{ variable: string; variableInstance: string }>;

export function createDateVariableAttrs({
  variable,
  variableInstance,
  label,
  value,
  format,
  custom,
  customAllowed,
}: CreateDateVariableAttrsArgs) {
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
        object: sayDataFactory.literal('date'),
      },
    );
    backlinks.push({
      subject: sayDataFactory.literalNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  let datatype: string | undefined;
  if (format) {
    datatype = !formatContainsTime(format)
      ? XSD('time').full
      : XSD('dateTime').full;
  }
  return {
    rdfaNodeType: 'literal',
    datatype: datatype,
    externalTriples,
    backlinks,
    label,
    content: value,
    format,
    customAllowed,
    custom,
  };
}
