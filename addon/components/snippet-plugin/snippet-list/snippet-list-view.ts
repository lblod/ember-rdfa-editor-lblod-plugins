import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SnippetList } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Args {
  snippetLists: SnippetList[];
  assignedSnippetListsIds: string[];
  listNameFilter: string | null;
  isLoading: boolean;
  onChange: (assignedSnippetListsIds: string[]) => void;
}

export default class SnippetListViewComponent extends Component<Args> {
  @action
  onChange(snippetId: string, isSelected: boolean) {
    if (isSelected) {
      const newSnippetListIds = [
        ...this.args.assignedSnippetListsIds,
        snippetId,
      ];

      return this.args.onChange(newSnippetListIds);
    }

    const newSnippetListIds = this.args.assignedSnippetListsIds.filter(
      (id) => id !== snippetId,
    );

    return this.args.onChange(newSnippetListIds);
  }

  @action
  onClickRow(snippetList: SnippetList, event: Event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const target = event.target;

    // Only trigger the action when clicking on a td or tr element
    // This is to prevent the action from being triggered when clicking on a checkbox
    if (target.tagName !== 'TD' && target.tagName !== 'TR') {
      return;
    }

    const snippetListId = snippetList.id;

    if (!snippetListId) {
      return;
    }

    const isSelected =
      this.args.assignedSnippetListsIds.includes(snippetListId);

    this.onChange(snippetListId, !isSelected);
  }

  get snippetLists() {
    return this.args.snippetLists;
  }
}
