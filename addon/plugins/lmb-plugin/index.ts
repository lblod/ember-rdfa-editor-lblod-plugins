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
  const mandateeNode = schema.node(
    'inline_rdfa',
    {
      rdfaNodeType: 'resource',
      subject: mandatee.mandateeUri,
    },
    [schema.text(`${mandatee.fullName}`)],
  );
  return mandateeNode;
}
