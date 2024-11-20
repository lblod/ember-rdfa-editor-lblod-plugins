import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { v4 as uuidv4 } from 'uuid';
import { Attrs } from '@lblod/ember-rdfa-editor';

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
  attrs.properties = (attrs.properties as OutgoingTriple[]).map((prop) => {
    if (prop.predicate === EXT('instance').full) {
      let recreatedUri;
      if (
        prop.object.value.includes(
          'http://data.lblod.info/variables/--ref-uuid4-',
        )
      ) {
        recreatedUri = `http://data.lblod.info/variables/--ref-uuid4-${uuidv4()}`;
      } else {
        recreatedUri = `http://data.lblod.info/variables/${uuidv4()}`;
      }
      return {
        predicate: prop.predicate,
        object: sayDataFactory.namedNode(recreatedUri),
      };
    }

    return prop;
  });
  return attrs;
}
