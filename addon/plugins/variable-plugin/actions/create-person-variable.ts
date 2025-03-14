import { Schema } from '@lblod/ember-rdfa-editor';
import { FOAF } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { Person } from '../variables';
import { v4 as uuidv4 } from 'uuid';

type CreatePersonVariableArgs = {
  schema: Schema;
} & CreatePersonVariableAttrsArgs;

export function createPersonVariable(args: CreatePersonVariableArgs) {
  const { schema } = args;
  return schema.nodes.person_variable.create(createPersonVariableAttrs(args));
}

type CreatePersonVariableAttrsArgs = { label?: string; value?: Person };

export function createPersonVariableAttrs({
  label,
  value,
}: CreatePersonVariableAttrsArgs) {
  const subject =
    value?.uri ?? `http://example.org/person-placeholder/${uuidv4()}`;
  const properties: OutgoingTriple[] = value
    ? [
        {
          predicate: FOAF('givenName').full,
          object: sayDataFactory.literal(value.firstName),
        },
        {
          predicate: FOAF('familyName').full,
          object: sayDataFactory.literal(value.lastName),
        },
      ]
    : [];
  return {
    rdfaNodeType: 'resource',
    subject,
    properties,
    label,
  };
}
