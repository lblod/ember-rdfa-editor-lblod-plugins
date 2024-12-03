import { SayController } from '@lblod/ember-rdfa-editor';
import { BestuursperiodeLabel } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { Person } from '../variable-plugin/variables';

export type LmbPluginConfig = {
  endpoint: string;
  defaultPeriod?: BestuursperiodeLabel;
  defaultAdminUnit?: string;
};

export function createPersonNode(controller: SayController, person: Person) {
  const schema = controller.schema;
  const fullName = `${person.firstName} ${person.lastName}`;
  const electeeNode = schema.node(
    'inline_rdfa',
    {
      rdfaNodeType: 'resource',
      subject: person.uri,
    },
    [schema.text(`${fullName}`)],
  );
  return electeeNode;
}
