import { Attrs } from '@lblod/ember-rdfa-editor';
import { generateVariableInstanceUri } from './variable-helpers';

export function recreateVariableUris(nodeAttrs: Attrs) {
  const attrs = { ...nodeAttrs };
  const variableInstanceUri = attrs.subject as string | null;
  if (variableInstanceUri) {
    const templateMode = variableInstanceUri.includes(`--ref-uuid4-`);
    attrs.subject = generateVariableInstanceUri({ templateMode });
  }
  return attrs;
}
