import { SayController, NodeSelection, PNode } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { v4 as uuidv4 } from 'uuid';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import {
  Resource,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { Area, Place } from './geo-helpers';
import { Address } from './address-helpers';

interface ReplaceSelectionWithLocationArgs {
  /** SayController */
  controller: SayController;
  /** The uri of the Location resource */
  subject: string;
  /** The object representing the location to insert */
  toInsert?: Place | Address | Area;
  /**
   * A list of Resources, each will be looked at in turn to compare the
   * `rdf:type` of the resource, if no parent is found matching the first, then the second will be
   * used, etc.
   *
   * If found, the location will be linked to that resource using prov:atLocation
   */
  subjectTypes?: Resource[];
  /**
   * If present, the location will be linked to this uri using prov:atLocation using external triples.
   */
  explicitSubjectToLinkTo?: string;
}

/**
 * Creates an 'OSLO location' node in place of the selection, along with the RDFa to create a triple
 * with the nearest parent of one of the passed types as the subject and the predicate
 * prov:atLocation. This doesn't work well with the RDFa tools, but since refactoring is required to
 * clean up the RDFa structure inherited from variables and to make it work well with 'undo', this
 * work was put off until then.
 */
export function replaceSelectionWithLocation({
  controller,
  subject,
  toInsert,
  subjectTypes,
  explicitSubjectToLinkTo,
}: ReplaceSelectionWithLocationArgs) {
  if (explicitSubjectToLinkTo) {
    console.log('EXPLICIT SUBJECT RECIEVED', explicitSubjectToLinkTo);
  }
  let resourceToLink: { pos: number; node: PNode } | undefined;
  subjectTypes?.forEach((subjectType) => {
    if (!resourceToLink) {
      resourceToLink = findAncestors(
        controller.mainEditorState.selection.$from,
        (node) => {
          if ('typeof' in node.attrs) {
            return subjectType.matches(node.attrs.typeof);
          }
          return hasOutgoingNamedNodeTriple(
            node.attrs,
            RDF('type'),
            subjectType,
          );
        },
      )[0];
    }
  });
  const backlinks = !resourceToLink
    ? []
    : [
        {
          predicate: PROV('atLocation').full,
          subject: sayDataFactory.resourceNode(
            resourceToLink.node.attrs.subject,
          ),
        },
      ];

  controller.withTransaction((tr) => {
    tr.replaceSelectionWith(
      controller.schema.node('oslo_location', {
        subject: subject,
        rdfaNodeType: 'resource',
        __rdfaId: uuidv4(),
        value: toInsert,
        properties: [],
        backlinks,
      }),
    );
    if (tr.selection.$anchor.nodeBefore) {
      const resolvedPos = tr.doc.resolve(
        tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
      );
      tr.setSelection(new NodeSelection(resolvedPos));
    }
    return tr;
  });
}
