import { type EditorState } from '@lblod/ember-rdfa-editor';
import { getOutgoingTripleList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import {
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { type BesluitType } from './fetchBesluitTypes';
import { type NamedNodeTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

export interface BesluitTypeInstance {
  parent: BesluitType;
  subType?: BesluitType;
  subSubType?: BesluitType;
}

export function extractBesluitTypeUris(editorState: EditorState): string[] {
  const besluitRange = getCurrentBesluitRange(editorState);
  if (!besluitRange) {
    return [];
  }
  return getOutgoingTripleList(besluitRange.node.attrs, RDF('type'))
    .filter(
      (type) =>
        type.object.termType === 'NamedNode' &&
        type.object.value.includes(
          'https://data.vlaanderen.be/id/concept/BesluitType/',
        ),
    )
    .map((type: NamedNodeTriple) => type?.object.value);
}

export function checkForDraftBesluitType(editorState: EditorState): boolean {
  const besluitRange = getCurrentBesluitRange(editorState);
  if (!besluitRange) {
    return false;
  }
  console.log(
    getOutgoingTripleList(besluitRange.node.attrs, EXT('isDraftDecisionType')),
  );
  return getOutgoingTripleList(
    besluitRange.node.attrs,
    EXT('isDraftDecisionType'),
  ).some(
    (draftTypeTriple: NamedNodeTriple) =>
      draftTypeTriple?.object.value === 'true',
  );
}

/**
 * Finds a decision type in the document and checks that it represents a valid decision type
 * according to the list of types passed in.
 */
export function checkBesluitTypeInstance(
  editorState: EditorState,
  types: BesluitType[],
): BesluitTypeInstance | false {
  const besluitTypes = extractBesluitTypeUris(editorState);

  if (besluitTypes.length === 0) {
    return false;
  } else if (besluitTypes.length !== 1) {
    console.warn(
      "More than one decision type found for document, we don't support this and will just take the first one",
      besluitTypes,
    );
  }
  const typeHierarchy = findBesluitTypeHierarchy(types, besluitTypes[0]);

  return (
    !!typeHierarchy && {
      parent: typeHierarchy[0],
      subType: typeHierarchy[1],
      subSubType: typeHierarchy[2],
    }
  );
}

function findBesluitTypeHierarchy(
  types: BesluitType[],
  uri: string,
): BesluitType[] | undefined {
  for (const type of types) {
    if (type.uri === uri) {
      return [type];
    } else if (type.subTypes?.length) {
      const subTypes = findBesluitTypeHierarchy(type.subTypes, uri);
      if (subTypes) {
        return [type, ...subTypes];
      }
    }
  }
  return;
}

/**
 * Checks that the passed type instance has all of the necessary sub-types selected (and no more)
 */
export function isValidTypeChoice({
  parent,
  subType,
  subSubType,
}: BesluitTypeInstance) {
  if (!parent.subTypes || parent.subTypes.length === 0) {
    return !subType && !subSubType;
  }
  if (!subType) {
    return false;
  }
  if (!subType.subTypes || subType.subTypes.length === 0) {
    return !subSubType;
  }
  return !!subSubType;
}

export function mostSpecificBesluitType(
  typeInstance: BesluitTypeInstance,
): BesluitType {
  return typeInstance.subSubType ?? typeInstance.subType ?? typeInstance.parent;
}
