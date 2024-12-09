import { SayController, NodeSelection, PNode } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  DCT,
  EXT,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { v4 as uuidv4 } from 'uuid';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import {
  Resource,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

/**
 * Creates an 'OSLO location' node in place of the selection, along with the RDFa to create a triple
 * with the nearest parent of one of the passed types as the subject and the predicate
 * prov:atLocation. This doesn't work well with the RDFa tools, but since refactoring is required to
 * clean up the RDFa structure inherited from variables and to make it work well with 'undo', this
 * work was put off until then.
 * @param controller - SayController
 * @param label - label to add to the node
 * @param templateMode - Whether to create template URIs in place of 'real' URIs
 * @param subjectTypes - A list of Resources, each will be looked at in turn to compare the
 * `rdf:type` of the resource, if no parent is found matching the first, then the second will be
 * used, etc.
 */
export function replaceSelectionWithLocation(
  controller: SayController,
  label?: string,
  templateMode?: boolean,
  subjectTypes?: Resource[],
) {
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

  const mappingResource = `http://data.lblod.info/mappings/${
    templateMode ? '--ref-uuid4-' : ''
  }$${uuidv4()}`;
  const variableInstance = `http://data.lblod.info/variables/${
    templateMode ? '--ref-uuid4-' : ''
  }$${uuidv4()}`;
  controller.withTransaction((tr) => {
    tr.replaceSelectionWith(
      controller.schema.node('oslo_location', {
        subject: mappingResource,
        rdfaNodeType: 'resource',
        __rdfaId: uuidv4(),
        properties: [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(variableInstance),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('address'),
          },
          {
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label || ''),
          },
        ],
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
