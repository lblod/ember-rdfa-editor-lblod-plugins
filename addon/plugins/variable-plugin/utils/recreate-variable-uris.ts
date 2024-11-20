import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { v4 as uuidv4 } from 'uuid';
import { Attrs } from '@lblod/ember-rdfa-editor';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

export function recreateVariableUris(nodeAttrs: Attrs) {
  const attrs = { ...nodeAttrs };
  if (
    attrs.subject &&
    (attrs.subject as string).includes(
      'http://data.lblod.info/mappings/--ref-uuid4-',
    )
  ) {
    attrs.subject = `http://data.lblod.info/mappings/--ref-uuid4-${uuidv4()}`;
  } else if (
    attrs.subject &&
    (attrs.subject as string).includes('http://data.lblod.info/mappings/')
  ) {
    attrs.subject = `http://data.lblod.info/mappings/${uuidv4()}`;
  }
  const instanceTriple = getOutgoingTriple(attrs, EXT('instance'));
  if (!instanceTriple) return attrs;
  let recreatedUri;
  if (
    instanceTriple.object.value.includes(
      'http://data.lblod.info/variables/--ref-uuid4-',
    )
  ) {
    recreatedUri = `http://data.lblod.info/variables/--ref-uuid4-${uuidv4()}`;
  } else {
    recreatedUri = `http://data.lblod.info/variables/${uuidv4()}`;
  }
  instanceTriple.object = sayDataFactory.namedNode(recreatedUri);
  return attrs;
}
