import Component from '@glimmer/component';
import { action } from '@ember/object';

interface Args {
  assignedSnippetListsIds: string[];
  onChange: (assignedSnippetListsIds: string[]) => void;
  closeModal: () => void;
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
}
