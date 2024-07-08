import { SayController } from "@lblod/ember-rdfa-editor";
import Mandatee from "@lblod/ember-rdfa-editor-lblod-plugins/models/mandatee";
import { v4 as uuid } from 'uuid';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  MANDAAT,
  FOAF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export type LmbPluginConfig = {
  endpoint: string;
};

export function createMandateeNode(controller: SayController, mandatee: Mandatee) {
  const schema = controller.schema;
    const firstNameUuid = uuid();
    const firstNameNode = schema.node(
      'inline_rdfa',
      {
        rdfaNodeType: 'literal',
        __rdfaId: firstNameUuid,
        backlinks: [
          {
            subject: sayDataFactory.literalNode(mandatee.personUri),
            predicate: FOAF('gebruikteVoornaam').prefixed,
          },
        ],
      },
      [schema.text(mandatee.firstName)],
    );
    const lastNameUuid = uuid();
    const lastNameNode = schema.node(
      'inline_rdfa',
      {
        rdfaNodeType: 'literal',
        __rdfaId: lastNameUuid,
        backlinks: [
          {
            subject: sayDataFactory.literalNode(mandatee.personUri),
            predicate: FOAF('familyName').prefixed,
          },
        ],
      },
      [schema.text(mandatee.lastName)],
    );

    const personNode = schema.node(
      'inline_rdfa',
      {
        rdfaNodeType: 'resource',
        subject: mandatee.personUri,
        properties: [
          {
            predicate: FOAF('gebruikteVoornaam').prefixed,
            object: sayDataFactory.literalNode(firstNameUuid),
          },
          {
            predicate: FOAF('familyName').prefixed,
            object: sayDataFactory.literalNode(lastNameUuid),
          },
        ],
        backlinks: [
          {
            subject: sayDataFactory.literalNode(mandatee.mandateeUri),
            predicate: MANDAAT('isBestuurlijkeAliasVan').prefixed,
          },
        ],
      },
      [firstNameNode, lastNameNode],
    );
    const mandateeNode = schema.node(
      'inline_rdfa',
      {
        rdfaNodeType: 'resource',
        subject: mandatee.mandateeUri,
        properties: [
          {
            predicate: MANDAAT('isBestuurlijkeAliasVan').prefixed,
            object: sayDataFactory.resourceNode(mandatee.personUri),
          },
        ],
      },
      [personNode],
    );
    return mandateeNode;
}
