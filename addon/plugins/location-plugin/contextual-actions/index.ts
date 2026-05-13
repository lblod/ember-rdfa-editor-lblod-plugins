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
import { getActiveEditableNode } from '@lblod/ember-rdfa-editor/plugins/editable-node';
import { isRdfaAttrs } from '@lblod/ember-rdfa-editor/core/rdfa-types';
import { v4 as uuidv4 } from 'uuid';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import IntlService from 'ember-intl/services/intl';
import { select } from '@ember/test-helpers';

const locationActionsGroupId = 'locatie-fde16805-5b4d-4595-9742-e434d477ee1d';

function createInsertPlaceDescriptionCommand(label: string) {
  return (state: EditorState, dispatch: (tr: Transaction) => void) => {
    return true;
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

export function getContextualActions() {
  return async function (state: EditorState) {
    const t = getTranslationFunction(state);

    // TODO: translate!
    const options = [
      { label: 'Adres invoegen', icon: 'location' },
      { label: 'Punt op de kaart invoegen', icon: 'location-gps' },
      { label: 'Gebied invoegen', icon: 'area' },
      { label: 'Perceel invoegen', icon: 'focus' },
    ];

    return options.map((option) => {
      return {
        ...option,
        id: uuidv4(),
        group: locationActionsGroupId,
        command: createInsertPlaceDescriptionCommand(option.label),
      };
    });
  };
}

function contextualGroupIsVisible(state: EditorState) {
  const { selection } = state;
  return (
    selection instanceof NodeSelection &&
    selection.node.type === selection.node.type.schema.nodes['oslo_location']
  );
}

export function getContextualActionGroups() {
  return function (state: EditorState) {
    return contextualGroupIsVisible(state)
      ? [
          {
            id: locationActionsGroupId,
            label: getTranslationFunction(state)(
              'variable.location.label',
              'Andere elementen',
            ),
          },
        ]
      : [];
  };
}
