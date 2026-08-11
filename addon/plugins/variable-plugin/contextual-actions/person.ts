import { EditorState, NodeSelection } from '@lblod/ember-rdfa-editor';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { getRankedPNodes } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/get-ranked-pnodes';
import { ContextualActionGroup } from '@lblod/ember-rdfa-editor/plugins/contextual-actions';
import { getPersonFromPNode } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/person';
import { v4 as uuidv4 } from 'uuid';
import { replacePersonCommand } from '../utils/replace-person';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

const PERSON_SUGGESTIONS_GROUP_ID =
  'person-suggestions-9cc92bb6-de78-41cf-824c-ed391b206764';

const SUGGESTION_AMOUNT = 15;

export function getContextualActions(state: EditorState, searchQuery?: string) {
  const selectedNode = getSelectedPersonNode(state);
  if (!selectedNode) return [];
  return getRankedPNodes(state, 'person_variable', (node) => node.attrs.subject)
    .map((rankedNode) => rankedNode.node)
    .filter(
      (node) => selectedNode.value.attrs.subject !== node.value.attrs.subject,
    )
    .slice(0, SUGGESTION_AMOUNT)
    .map((node) => {
      const person = getPersonFromPNode(node.value);
      if (!person) return;
      return {
        label: person.fullName,
        id: uuidv4(),
        group: PERSON_SUGGESTIONS_GROUP_ID,
        command: replacePersonCommand(selectedNode, person),
      };
    })
    .filter(
      (option) =>
        option !== undefined &&
        (!searchQuery ||
          option.label.toLocaleLowerCase().includes(searchQuery.toLowerCase())),
    );
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
        getActions: getContextualActions,
      },
    ];
  };
}
