import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SnippetList } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table/th-sortable';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import inArray from '@lblod/ember-rdfa-editor-lblod-plugins/helpers/in-array';
import { OrderBy } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/utils/fetch-data';
import { uniqueId } from '@ember/helper';
import CollapsibleTagList from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/collapsible-tag-list';

interface Signature {
  Args: {
    snippetLists?: SnippetList[] | null;
    snippetListUris: string[];
    listNameFilter: string | null;
    isLoading: boolean;
    onChange: (snippetListUris: string[]) => void;
    sort: OrderBy;
  };
}

export default class SnippetListView extends Component<Signature> {
  @action
  onChange(snippetUri: string, isSelected: boolean) {
    if (isSelected) {
      const newSnippetListUris = [...this.args.snippetListUris, snippetUri];

      return this.args.onChange(newSnippetListUris);
    }

    const newSnippetListUris = this.args.snippetListUris.filter(
      (uri) => uri !== snippetUri,
    );

    return this.args.onChange(newSnippetListUris);
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

    const snippetListUri = snippetList.uri;

    if (!snippetListUri) {
      return;
    }

    const isSelected = this.args.snippetListUris.includes(snippetListUri);

    this.onChange(snippetListUri, !isSelected);
  }

  get snippetLists() {
    return this.args.snippetLists;
  }

  <template>
    {{#let
      (t 'snippet-plugin.snippet-list.modal.table.list')
      (t 'snippet-plugin.snippet-list.modal.table.created')
      (t 'snippet-plugin.snippet-list.modal.table.select')
      (t 'snippet-plugin.snippet-list.modal.table.imported-resources')
      (t 'snippet-plugin.snippet-list.modal.table.tags')
      as |list created select imported tags|
    }}
      {{! @glint-expect-error au-data-table does not have type annotations yet }}
      <AuDataTable
        @content={{this.snippetLists}}
        @isLoading={{@isLoading}}
        @noDataMessage={{t 'common.search.no-results'}}
        @sort={{@sort}}
        @onClickRow={{this.onClickRow}}
        @hidePagination={{true}}
        as |t|
      >
        <t.content as |c|>
          <c.header>
            <th class='snippet-list-table-select-column'>{{select}}</th>
            {{! @glint-expect-error au-data-table does not have type annotations yet }}
            <AuDataTableThSortable
              @field='label'
              @label={{list}}
              @currentSorting={{@sort}}
              @class='data-table__header-title'
            />
            <th>{{imported}}</th>
            <th>{{tags}}</th>
            {{! @glint-expect-error au-data-table does not have type annotations yet }}
            <AuDataTableThSortable
              @field='createdOn'
              @label={{created}}
              @currentSorting={{@sort}}
              @class='data-table__header-title snippet-list-table-created-column'
            />
          </c.header>
          <c.body as |row|>
            <td class='snippet-list-table-select-column'>
              <AuCheckbox
                id={{(uniqueId)}}
                @onChange={{fn this.onChange row.uri}}
                @checked={{inArray @snippetListUris row.uri}}
              />
            </td>
            <td>{{row.label}}</td>
            <td>{{row.importedResources}}</td>
            <td>
              {{#if row.tags.length}}
                <CollapsibleTagList @tags={{row.tags}} />
              {{/if}}
            </td>
            <td class='snippet-list-table-created-column'>{{row.createdOn}}</td>
          </c.body>
        </t.content>
      </AuDataTable>
    {{/let}}
  </template>
}
