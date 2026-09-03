import { EditorState, NodeSelection } from '@lblod/ember-rdfa-editor';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { getRankedPNodes } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/get-ranked-pnodes';
import { ContextualActionGroup } from '@lblod/ember-rdfa-editor/plugins/contextual-actions';
import { getPersonFromPNode } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/person';
import { v4 as uuidv4 } from 'uuid';
import { replacePersonCommand } from '../utils/replace-person';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { type ContextualAction } from '@lblod/ember-rdfa-editor/plugins/contextual-actions/index';
import { LmbPluginConfig, openLmbModalCommand } from '../../lmb-plugin';
import { fetchElectees } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/lmb-plugin/utils/fetchElectees';
import { BESTUURSPERIODES } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

const PERSON_SUGGESTIONS_GROUP_ID =
  'person-suggestions-9cc92bb6-de78-41cf-824c-ed391b206764';

const OTHER_ELEMENTS_GROUP_ID =
  'person-other-elements-5c66b28f-22ff-4f0a-bd24-4f90cdc5a64a';

const ASYNC_SEARCH_GROUP_ID =
  'person-async-search-5545e1fa-aa23-4a77-8c5d-b97481d58fc4';

const SUGGESTION_AMOUNT = 15;
const SEARCH_PAGE_SIZE = 20;

function getOtherElementsActions(state: EditorState) {
  const translate = getTranslationFunction(state);
  return [
    {
      label: translate(
        'variable-plugin.person.advanced-search',
        'Geavanceerd zoeken',
      ),
      id: uuidv4(),
      group: OTHER_ELEMENTS_GROUP_ID,
      command: openLmbModalCommand(),
      icon: 'search',
    },
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

function getAsyncSearchActionsGetter(args: LmbPluginConfig) {
  return async function getAsyncSearchActions(
    state: EditorState,
    searchQuery?: string,
  ) {
    const selectedNode = getSelectedPersonNode(state);
    if (!searchQuery || !selectedNode) return [];

    const persons = await fetchElectees({
      endpoint: args.endpoint,
      page: 0,
      pageSize: SEARCH_PAGE_SIZE,
      searchString: searchQuery,
      adminUnitSearch: args.defaultAdminUnit ?? '',
      sort: false,
      period:
        args.defaultPeriod ?? Object.values(BESTUURSPERIODES).at(-1) ?? '',
    });
    return persons.electees.map((person) => ({
      label: person.fullName,
      id: uuidv4(),
      group: ASYNC_SEARCH_GROUP_ID,
      command: replacePersonCommand(selectedNode, person),
    }));
  };
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

export function getPersonActionGroups(args: LmbPluginConfig) {
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
        getActions: getOtherElementsActions,
        sticky: 'bottom',
      },
      {
        id: ASYNC_SEARCH_GROUP_ID,
        priority: 10,
        getActions: getAsyncSearchActionsGetter(args),
        searchDebounceMs: 300,
        loadingMessage: t(
          'variable-plugin.person.searching',
          'Aan het zoeken…',
        ),
      },
    ];
  };
}
