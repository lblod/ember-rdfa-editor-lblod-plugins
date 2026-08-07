import { v4 as uuidv4 } from 'uuid';
import { EditorState } from '@lblod/ember-rdfa-editor';
import { getActiveEditableNode } from '@lblod/ember-rdfa-editor/plugins/editable-node';
import { isRdfaAttrs } from '@lblod/ember-rdfa-editor/core/rdfa-types';
import { ContextualActionGroup } from '@lblod/ember-rdfa-editor/plugins/contextual-actions';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { updateCodelistVariableCommand } from '../utils/codelist-utils';
import {
  type CodeListOptions,
  fetchCodeListOptions,
  CodeListOption,
} from '../utils/fetch-data';
import { CodelistAttrs } from '../variables';

const codelistGroupId = 'codelist-db36f85d-edbf-45dc-85fc-9fb67649fe00';

const codelistOptionsCache: Map<string, CodeListOptions> = new Map();

function getSource(codelistAttrs: CodelistAttrs, fallback?: string) {
  if (codelistAttrs) {
    const source = codelistAttrs['source'];
    if (source && source !== 'UNKNOWN') {
      return source;
    }
  }
  return fallback;
}

type GetContextualActionsAttrs = {
  endpoint?: string;
};

function humanReadableLabel(label: string) {
  return label.replace(/\$\{[^}]+\}/g, '…');
}

async function getCodelistOptionsCached(
  activeNode: ResolvedPNode,
  { endpoint }: GetContextualActionsAttrs,
) {
  const codelistAttrs = activeNode.value.attrs as CodelistAttrs | undefined;
  const source = codelistAttrs && getSource(codelistAttrs, endpoint);
  const codelistUri = codelistAttrs?.codelist;

  let result = codelistUri && codelistOptionsCache.get(codelistUri);
  if (!result && codelistAttrs?.hardcodedOptionList) {
    result = {
      type: '',
      options: codelistAttrs.hardcodedOptionList,
    } as CodeListOptions;
  }
  if (!result && source && codelistUri) {
    result = await fetchCodeListOptions(source, codelistUri);
    codelistOptionsCache.set(codelistUri, result);
    if (!result) {
      console.warn(
        `Failed to fetch codelist options for ${codelistUri} from ${source}`,
      );
    }
  }

  return result || { type: '', options: [] };
}

export function getContextualActions(attrs: GetContextualActionsAttrs) {
  return async function (state: EditorState, searchQuery?: string) {
    const activeNode = getActiveEditableNode(state);
    if (!activeNode) return [];
    const result = await getCodelistOptionsCached(activeNode, attrs);
    const isMultiSelect = activeNode.value.attrs['selectionStyle'] === 'multi';
    const selectedOptions: CodeListOption[] = [];
    activeNode.value.content.forEach((contentNode) => {
      selectedOptions.push({
        uri: contentNode.attrs.subject,
        label: contentNode.textContent,
      });
    });

    return result.options
      .filter(
        (option) =>
          !searchQuery ||
          option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map((option) => {
        const selected = selectedOptions.some(
          (selOption) => selOption.uri === option.uri,
        );
        const newOptions = selected
          ? selectedOptions.filter((selOption) => selOption.uri !== option.uri)
          : isMultiSelect
            ? [...selectedOptions, option]
            : option;
        return {
          id: uuidv4(),
          label: humanReadableLabel(option.label),
          group: codelistGroupId,
          command: updateCodelistVariableCommand(activeNode, newOptions),
          selected,
        };
      });
  };
}

function contextualGroupIsVisible(state: EditorState) {
  const activeNode = getActiveEditableNode(state);
  const isCodelist =
    activeNode &&
    isRdfaAttrs(activeNode.value.attrs) &&
    activeNode?.value.type.name === 'codelist';

  return isCodelist;
}

export function getCodelistActionGroups(attrs: GetContextualActionsAttrs) {
  return function (state: EditorState): ContextualActionGroup[] {
    return contextualGroupIsVisible(state)
      ? [
          {
            id: codelistGroupId,
            label: getTranslationFunction(state)(
              'variable.codelist.label',
              'Codelijst',
            ),
            keepOpen: true,
            getActions: getContextualActions(attrs),
          },
        ]
      : [];
  };
}
