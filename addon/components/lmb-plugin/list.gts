import type { TOC } from '@ember/component/template-only';
import AuTable from '@appuniversum/ember-appuniversum/components/au-table';
import SortableTableHeader from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/sort/sortable-table-header';
import { SearchSort } from './search-modal';
import t from 'ember-intl/helpers/t';
import Electee from '@lblod/ember-rdfa-editor-lblod-plugins/models/electee';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { TaskInstance } from 'reactiveweb/ember-concurrency';

interface Signature {
  Args: {
    sort: SearchSort;
    setSort: (sort: SearchSort) => void;
    services: TaskInstance<{ results: Electee[]; totalCount: number }>;
    insert: (electee: Electee) => unknown;
  };
}

const List: TOC<Signature> = <template>
  <AuTable>
    <:header>
      <tr class='au-c-data-table__header-title'>
        <th>
          <SortableTableHeader
            @field='fullName'
            @label={{t 'lmb-plugin.modal.fields.name'}}
            @sort={{@sort}}
            @setSort={{@setSort}}
          />
        </th>
        <th>
          <SortableTableHeader
            @field='kandidatenlijst'
            @label={{t 'lmb-plugin.modal.fields.kandidatenlijst'}}
            @sort={{@sort}}
            @setSort={{@setSort}}
          />
        </th>
        <th />
      </tr>
    </:header>
    <:body>
      {{#if @services.isRunning}}
        <tr>
          <td colspan='100%'>
            <AuLoader @centered={{true}}>
              {{t 'common.search.loading'}}
            </AuLoader>
          </td>
        </tr>
      {{else}}
        {{#if @services.value.totalCount}}
          {{#each @services.value.results as |row|}}
            <tr>
              <td>{{row.fullName}}</td>
              <td>
                {{#if row.kandidatenlijst}}
                  {{row.kandidatenlijst}}
                {{else}}
                  <span class='au-u-italic'>{{t 'common.not-applicable'}}</span>
                {{/if}}
              </td>
              <td class='au-u-text-center'>
                <AuButton {{on 'click' (fn @insert row)}}>
                  {{t 'lmb-plugin.modal.insert'}}
                </AuButton>
              </td>
            </tr>
          {{/each}}
        {{else}}
          <tr>
            <td colspan='100%'>
              {{t 'common.search.no-results'}}
            </td>
          </tr>
        {{/if}}
      {{/if}}
    </:body>
  </AuTable>
</template>;

export default List;
