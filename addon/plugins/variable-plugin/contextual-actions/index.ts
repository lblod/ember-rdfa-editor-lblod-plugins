import {
  EditorState,
  NodeSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { fetchCodeListOptions } from '../utils/fetch-data';
import { findParentNode } from '@curvenote/prosemirror-utils';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  EXT,
  MOBILITEIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  ZONALITY_OPTIONS,
  ZONALITY_OPTIONS_LEGACY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/constants';
import { ProseParser } from '@lblod/ember-rdfa-editor';
import { wrapVariableInHighlight } from '../utils/codelist-utils';
import { getActiveEditableNode } from '@lblod/ember-rdfa-editor/plugins/editable-node';
import { isRdfaAttrs } from '@lblod/ember-rdfa-editor/core/rdfa-types';
import { v4 as uuidv4 } from 'uuid';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';

const plaatsbepalingGroupId =
  'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5';

function getSelectedLocation(state: EditorState) {
  const { selection } = state;
  if (
    selection instanceof NodeSelection &&
    selection.node.type === state.schema.nodes.location
  ) {
    return {
      node: selection.node,
      pos: selection.from,
    };
  } else {
    return;
  }
}

function getSource(state: EditorState, fallback?: string) {
  const selectedLocation = getSelectedLocation(state);
  if (selectedLocation) {
    const { node } = selectedLocation;
    const source = node.attrs.source;
    if (source) {
      return source;
    }
  }

  return fallback;
}

function getIsZonal(state: EditorState) {
  const { selection } = state;
  const mobilityMeasureNode = findParentNode((node) =>
    hasOutgoingNamedNodeTriple(
      node.attrs,
      RDF('type'),
      MOBILITEIT('Mobiliteitsmaatregel'),
    ),
  )(selection)?.node;
  if (!mobilityMeasureNode) {
    return false;
  }
  const zonalityTriple = getOutgoingTriple(
    mobilityMeasureNode.attrs,
    EXT('zonality'),
  );
  if (!zonalityTriple) {
    return false;
  }
  return (
    zonalityTriple.object.value === ZONALITY_OPTIONS.ZONAL ||
    zonalityTriple.object.value === ZONALITY_OPTIONS_LEGACY.ZONAL
  );
}

type GetContextualActionsAttrs = {
  zonalLocationCodelistUri: string;
  nonZonalLocationCodelistUri: string;
  endpoint?: string;
};

function humanReadableLabel(label: string) {
  return label.replace(/\$\{[^}]+\}/g, '…');
}

function createInsertPlaceDescriptionCommand(label: string) {
  return (state: EditorState, dispatch: (tr: Transaction) => void) => {
    if (dispatch) {
      let htmlToInsert = label;
      htmlToInsert = wrapVariableInHighlight(htmlToInsert);
      const domParser = new DOMParser();
      const htmlNode = domParser.parseFromString(htmlToInsert, 'text/html');
      const contentFragment = ProseParser.fromSchema(state.schema).parseSlice(
        htmlNode,
        {
          preserveWhitespace: false,
        },
      );

      const tr = state.tr;
      const startPos = tr.selection.from;
      tr.replaceSelection(contentFragment);

      let highlightPos: number | null = null;

      contentFragment.content.descendants((child, pos) => {
        if (highlightPos !== null) {
          return false;
        }
        if (child.type.name === state.schema.nodes.placeholder.name) {
          highlightPos = startPos + pos;
          return false;
        }
        return true;
      });

      if (highlightPos !== null) {
        tr.setSelection(NodeSelection.create(tr.doc, highlightPos));
      }
      dispatch(tr);
    }
    return true;
  };
}

export function getContextualActions({
  zonalLocationCodelistUri,
  nonZonalLocationCodelistUri,
  endpoint,
}: GetContextualActionsAttrs) {
  return async function (state: EditorState) {
    const source = getSource(state, endpoint);
    const isZonal = getIsZonal(state);
    const result = await fetchCodeListOptions(
      source,
      isZonal ? zonalLocationCodelistUri : nonZonalLocationCodelistUri,
    );

    return result.options.map((option) => {
      return {
        id: uuidv4(),
        label: humanReadableLabel(option.label),
        group: plaatsbepalingGroupId,
        command: createInsertPlaceDescriptionCommand(option.label),
      };
    });
  };
}

function contextualGroupIsVisible(state: EditorState) {
  const activeNode = getActiveEditableNode(state);
  const isPlaatsbepaling =
    activeNode &&
    isRdfaAttrs(activeNode.value.attrs) &&
    activeNode.value.attrs.backlinks.some((value) =>
      MOBILITEIT('plaatsbepaling').matches(value.predicate),
    );

  const isEmptySelection = state.selection.empty;
  return (
    (activeNode?.value.type.name === 'location' || isPlaatsbepaling) &&
    isEmptySelection
  );
}

export function getContextualActionGroups() {
  return function (state: EditorState) {
    return contextualGroupIsVisible(state)
      ? [
          {
            id: plaatsbepalingGroupId,
            label: getTranslationFunction(state)(
              'variable.location.label',
              'Plaatsbeschrijving',
            ),
          },
        ]
      : [];
  };
}
