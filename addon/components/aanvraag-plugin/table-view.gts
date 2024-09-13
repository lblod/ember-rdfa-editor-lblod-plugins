import { TemplateOnlyComponent } from '@ember/component/template-only';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
// @ts-expect-error No types in the lib :(
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
// @ts-expect-error No types in the lib :(
import AuDataTableTextSearch from '@appuniversum/ember-appuniversum/components/au-data-table/text-search';
// @ts-expect-error No types in the lib :(
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table/th-sortable';
import {
  Aanvraag,
  AanvraagResults,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/aanvraag-plugin';

interface Args {
  results: AanvraagResults | null;
  sort?: string;
  isLoading: boolean;
  onInsert: (aanvraag: Aanvraag) => void;
  // Filtering
  filter: string | null;
  // Pagination
  pageNumber: number;
}

const TableView: TemplateOnlyComponent<Args> = <template>
  <div class='say-snippet-lists-table'>
    {{#let (t 'lpdc-plugin.modal.insert') as |insert|}}
      <AuDataTable
        @content={{@results.data}}
        @isLoading={{@isLoading}}
        @noDataMessage={{t 'common.search.no-results'}}
        @sort={{@sort}}
        @page={{@pageNumber}}
        @size={{25}}
        as |t|
      >
        <t.menu as |menu|>
          <menu.general>
            <AuToolbar class='au-o-box' as |Group|>
              <Group />
              <Group class='au-c-toolbar__group--center'>
                <AuDataTableTextSearch
                  @wait={{500}}
                  @filter={{@filter}}
                  @placeholder='zoeken'
                />
              </Group>
            </AuToolbar>
          </menu.general>
        </t.menu>
        <t.content as |c|>
          <c.header>
            <AuDataTableThSortable
              @field='title'
              @label='titel'
              @currentSorting={{@sort}}
              @class='data-table__header-title'
            />
            <AuDataTableThSortable
              @field='gemeente'
              @label='gemeente'
              @currentSorting={{@sort}}
              @class='data-table__header-title'
            />
            <AuDataTableThSortable
              @field='object'
              @label='object'
              @currentSorting={{@sort}}
              @class='data-table__header-title'
            />
            <AuDataTableThSortable
              @field='description'
              @label='beschrijving'
              @currentSorting={{@sort}}
              @class='data-table__header-title'
            />
            <th class='snippet-list-table-select-column'>{{insert}}</th>
          </c.header>
          <c.body as |row|>
            <td>{{row.title}}</td>
            <td>{{row.gemeente}}</td>
            <td>{{row.object}}</td>
            <td>{{row.description}}</td>
            <td class='snippet-list-table-select-column'>
              <AuButton {{on 'click' (fn @onInsert row)}}>
                {{insert}}
              </AuButton>
            </td>
          </c.body>
        </t.content>
      </AuDataTable>
    {{/let}}
  </div>
</template>;

export default TableView;
