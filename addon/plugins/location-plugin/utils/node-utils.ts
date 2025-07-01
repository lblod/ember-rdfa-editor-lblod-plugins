import { SayController } from '@lblod/ember-rdfa-editor';
import { Resource } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { Area, Place } from './geo-helpers';
import { Address } from './address-helpers';
import { replaceSelectionWithLocation as replaceSelectionWithLocationInternal } from '../_private/utils/node-utils';
/**
 * @deprecated
 * Creates an 'OSLO location' node in place of the selection, along with the RDFa to create a triple
 * with the nearest parent of one of the passed types as the subject and the predicate
 * prov:atLocation. This doesn't work well with the RDFa tools, but since refactoring is required to
 * clean up the RDFa structure inherited from variables and to make it work well with 'undo', this
 * work was put off until then.
 * @param controller - SayController
 * @param toInsert - The object representing the location to insert
 * @param subjectTypes - A list of Resources, each will be looked at in turn to compare the
 * `rdf:type` of the resource, if no parent is found matching the first, then the second will be
 * used, etc.
 */
export function replaceSelectionWithLocation(
  controller: SayController,
  toInsert: Place | Address | Area,
  subjectTypes?: Resource[],
) {
  return replaceSelectionWithLocationInternal(
    controller,
    toInsert.uri,
    toInsert,
    subjectTypes,
  );
}
