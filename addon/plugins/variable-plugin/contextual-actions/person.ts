import { EditorState, NodeSelection } from '@lblod/ember-rdfa-editor';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { getRankedPNodes } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/get-ranked-pnodes';
import { ContextualActionGroup } from '@lblod/ember-rdfa-editor/plugins/contextual-actions';
import { getPersonFromPNode } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/person';
import { v4 as uuidv4 } from 'uuid';
import { replacePersonCommand } from '../utils/replace-person';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { type ContextualAction } from '@lblod/ember-rdfa-editor/plugins/contextual-actions/index';
import { openLmbModalCommand } from '../../lmb-plugin';

const PERSON_SUGGESTIONS_GROUP_ID =
  'person-suggestions-9cc92bb6-de78-41cf-824c-ed391b206764';

const OTHER_ELEMENTS_GROUP_ID =
  'person-other-elements-5c66b28f-22ff-4f0a-bd24-4f90cdc5a64a';

const SUGGESTION_AMOUNT = 15;

function getOtherElementsActions(state: EditorState) {
  const translate = getTranslationFunction(state);
  return [
    {
      label: translate(
        'variable-plugin.person.insert-electee',
        'Verkozene invoegen',
      ),
      id: uuidv4(),
      group: OTHER_ELEMENTS_GROUP_ID,
      command: openLmbModalCommand(),
    },
    // {
    //   label: translate(
    //     'variable-plugin.person.insert-mandatee',
    //     'Mandataris invoegen',
    //   ),
    //   id: uuidv4(),
    //   group: OTHER_ELEMENTS_GROUP_ID,
    //   command: null,
    // },
  ];
}

function getSuggestionsActions(state: EditorState) {
  const selectedNode = getSelectedPersonNode(state);
  if (!selectedNode) return [];
  return getRankedPNodes(state, 'person_variable', (node) => node.attrs.subject)
    .map((rankedNode) => rankedNode.node)
    .filter(
      (node) => selectedNode.value.attrs.subject !== node.value.attrs.subject,
    )
    .slice(0, SUGGESTION_AMOUNT)
    .flatMap((node) => {
      const person = getPersonFromPNode(node.value);
      if (!person) return [];
      return [
        {
          label: person.fullName,
          id: uuidv4(),
          group: PERSON_SUGGESTIONS_GROUP_ID,
          command: replacePersonCommand(selectedNode, person),
        },
      ];
    });
}

function makeSearchable(
  actionGetter: (state: EditorState) => ContextualAction[],
) {
  return function (state: EditorState, searchQuery?: string) {
    return actionGetter(state).filter(
      (option) =>
        !searchQuery ||
        option.label.toLocaleLowerCase().includes(searchQuery.toLowerCase()),
    );
  };
}

function getSelectedPersonNode(state: EditorState): ResolvedPNode | null {
  const { selection } = state;
  return selection instanceof NodeSelection &&
    selection.node.type === selection.node.type.schema.nodes['person_variable']
    ? { value: selection.node, pos: selection.from }
    : null;
}

export function getPersonActionGroups() {
  return function (state: EditorState): ContextualActionGroup[] {
    const selectedNode = getSelectedPersonNode(state);
    if (!selectedNode) return [];
    const t = getTranslationFunction(state);
    return [
      {
        id: PERSON_SUGGESTIONS_GROUP_ID,
        label: t('variable-plugin.person.suggestions', 'Suggesties'),
        getActions: makeSearchable(getSuggestionsActions),
      },
      {
        id: OTHER_ELEMENTS_GROUP_ID,
        getActions: makeSearchable(getOtherElementsActions),
        sticky: 'bottom',
      },
    ];
  };
}
