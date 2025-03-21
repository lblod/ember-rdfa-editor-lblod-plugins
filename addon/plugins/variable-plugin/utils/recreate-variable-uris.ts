import { Attrs } from '@lblod/ember-rdfa-editor';
import { generateVariableInstanceUri } from './variable-helpers';
import {
  FullTriple,
  IncomingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import {
  RDF,
  VARIABLES,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

export function recreateVariableUris(attrs: Attrs) {
  const externalTriples = attrs.externalTriples as Option<FullTriple[]>;
  if (!externalTriples || !externalTriples.length) {
    return attrs;
  }
  const variableInstanceTriple = externalTriples.find(
    (triple) =>
      RDF('type').matches(triple.predicate) &&
      VARIABLES('VariableInstance').matches(triple.object.value),
  );
  if (!variableInstanceTriple) {
    return attrs;
  }
  const variableInstanceUri = variableInstanceTriple.subject.value;
  const templateMode = variableInstanceUri.includes(`--ref-uuid4-`);
  const newInstanceUri = generateVariableInstanceUri({ templateMode });
  const newTriples = externalTriples.map((triple) => {
    const newTriple = { ...triple };
    if (triple.subject.value === variableInstanceUri) {
      newTriple.subject = sayDataFactory.namedNode(newInstanceUri);
    }
    if (triple.object.value === variableInstanceUri) {
      newTriple.object = sayDataFactory.namedNode(newInstanceUri);
    }
    return newTriple;
  });
  const backlinks = attrs.backlinks as Option<IncomingTriple[]>;
  const newBacklinks = backlinks?.map((backlink) => {
    const newBacklink = { ...backlink };
    if (backlink.subject.value === variableInstanceUri) {
      newBacklink.subject = sayDataFactory.resourceNode(newInstanceUri);
    }
    return newBacklink;
  });
  console.log({
    ...attrs,
    externalTriples: newTriples,
    backlinks: newBacklinks,
  });
  return {
    ...attrs,
    externalTriples: newTriples,
    backlinks: newBacklinks,
  };
}
