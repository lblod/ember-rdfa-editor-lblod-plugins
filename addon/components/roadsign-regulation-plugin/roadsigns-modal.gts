import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';

import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import { RoadsignRegulationPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';
import {
  countMobilityMeasures,
  queryMobilityMeasures,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/mobility-measure-concept';
import queryRoadSignCategories from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/road-sign-category';
import querySignCodes from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/sign-codes';
import { MobilityMeasureConcept } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/schemas/mobility-measure-concept';
import { pagination } from '@lblod/ember-rdfa-editor-lblod-plugins/helpers/pagination';
import { restartableTask, task, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import PowerSelect from 'ember-power-select/components/power-select';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import { TaskInstance, trackedTask } from 'reactiveweb/ember-concurrency';
import { trackedFunction } from 'reactiveweb/function';
import RoadSignsTable from './roadsigns-table';
import PaginationView from '../pagination/pagination-view';
import { not, or } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import {
  SIGN_CONCEPT_TYPES,
  ZONALITY_OPTIONS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/constants';
import { resolveTemplate } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/actions/resolve-template';
import { queryMobilityTemplates } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/mobility-template';
import insertMeasure from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/actions/insert-measure';

type Option = {
  uri: string;
  label: string;
};

type Zonality = Option;
type TypeOption = Option;
type Code = Option;
type Category = Option;

const DEBOUNCE_MS = 100;
const PAGE_SIZE = 10;

type Signature = {
  Args: {
    modalOpen?: boolean;
    closeModal: () => void;
    controller: SayController;
    options: RoadsignRegulationPluginOptions;
  };
};
export default class RoadsignsModal extends Component<Signature> {
  pageSize = PAGE_SIZE;
  @tracked pageNumber = 0;

  @tracked selectedZonality?: Zonality;
  @tracked selectedCode?: Code;
  @tracked selectedCodeCombination?: Code[];
  @tracked selectedType?: TypeOption;
  @tracked selectedCategory?: Category;

  @tracked searchQuery?: string;

  zonalityOptions: Zonality[] = [
    {
      uri: ZONALITY_OPTIONS.ZONAL,
      label: 'Zonaal',
    },
    {
      uri: ZONALITY_OPTIONS.NON_ZONAL,
      label: 'Niet zonaal',
    },
  ];

  get endpoint() {
    return this.args.options.endpoint;
  }

  get imageBaseUrl() {
    return this.args.options.imageBaseUrl;
  }

  get controller() {
    return this.args.controller;
  }

  get decisionLocation() {
    const decisionRange = getCurrentBesluitRange(this.controller);
    return decisionRange
      ? { node: decisionRange.node, pos: decisionRange.from }
      : null;
  }

  @action
  changeTypeOrCategory(option: Option) {
    if (!option) {
      this.selectedType = undefined;
      this.selectedCategory = undefined;
    } else {
      if (
        (this.signConceptTypes.map((type) => type.uri) as string[]).includes(
          option.uri,
        )
      ) {
        this.selectedType = option;
        this.selectedCategory = undefined;
      } else {
        this.selectedType = undefined;
        this.selectedCategory = option;
      }
    }
    this.selectedCode = undefined;
    this.selectedCodeCombination = undefined;
    this.resetPagination();
  }

  @action
  changeCode(value: Code) {
    this.selectedCode = value;
    this.selectedCodeCombination = undefined;
    this.resetPagination();
  }

  @action
  changeCodeCombination(value: Code[]) {
    this.selectedCodeCombination = value;
    this.resetPagination();
  }

  @action
  changeZonality(value: Zonality) {
    this.selectedZonality = value;
    this.resetPagination();
  }

  @action
  handleSearch(event: InputEvent) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.resetPagination();
  }

  @action
  closeModal() {
    this.args.closeModal();
  }

  searchCodes = restartableTask(async (term: string) => {
    const category = this.selectedCategory?.label;
    const type = this.selectedType?.label;
    const types = type ? [type] : undefined;
    await timeout(DEBOUNCE_MS);
    const abortController = new AbortController();
    try {
      return querySignCodes(this.endpoint, {
        searchString: term,
        roadSignCategory: category,
        types,
      });
    } finally {
      abortController.abort();
    }
  });

  // Note: this code does not fully work/is not fully reactive with ember 5.6+
  // Check-out https://github.com/universal-ember/reactiveweb/issues/110 for more information
  codeCombinationOptionsQuery = trackedFunction(this, async () => {
    const selectedCode = this.selectedCode;
    if (!selectedCode) {
      return [];
    }
    let signs: string[] = [selectedCode.uri];
    if (this.selectedCodeCombination) {
      signs = [...signs, ...this.selectedCodeCombination.map((s) => s.uri)];
    }
    return querySignCodes(this.endpoint, {
      combinedWith: signs,
    });
  });

  get codeCombinationOptions() {
    return this.codeCombinationOptionsQuery.value ?? [];
  }

  classificationsQuery = trackedFunction(this, async () => {
    return queryRoadSignCategories(this.endpoint);
  });

  get classifications() {
    return this.classificationsQuery.value ?? [];
  }

  signConceptTypes = [
    {
      label: 'Verkeersborden',
      uri: SIGN_CONCEPT_TYPES.ROAD_SIGN,
    },
    {
      label: 'Wegmarkeringen',
      uri: SIGN_CONCEPT_TYPES.ROAD_MARKING,
    },
    {
      label: 'Verkeerslichten',
      uri: SIGN_CONCEPT_TYPES.TRAFFIC_LIGHT,
    },
  ];

  get typeOptions(): {
    groupName: string;
    options: TypeOption[];
  }[] {
    return [
      {
        groupName: 'Types',
        options: this.signConceptTypes,
      },
      {
        groupName: 'Categorieën',
        options: this.classifications,
      },
    ];
  }

  measureConceptsTask = restartableTask(async () => {
    const codes: Code[] = [];
    if (this.selectedCodeCombination) {
      codes.push(...this.selectedCodeCombination);
    }
    if (this.selectedCode) {
      codes.push(this.selectedCode);
    }
    const queryOptions = {
      imageBaseUrl: this.imageBaseUrl,
      searchString: this.searchQuery,
      zonality: this.selectedZonality ? this.selectedZonality.uri : undefined,
      signType: this.selectedType ? this.selectedType.uri : undefined,
      codes: codes.length ? codes.map((code) => code.uri) : undefined,
      category: this.selectedCategory ? this.selectedCategory.uri : undefined,
      page: this.pageNumber,
      pageSize: PAGE_SIZE,
    };
    await timeout(DEBOUNCE_MS);

    const abortController = new AbortController();
    try {
      const [measureConcepts, measureConceptCount] = await Promise.all([
        queryMobilityMeasures(this.endpoint, {
          ...queryOptions,
          abortSignal: abortController.signal,
        }),
        countMobilityMeasures(this.endpoint, {
          ...queryOptions,
          abortSignal: abortController.signal,
        }),
      ]);
      return {
        concepts: measureConcepts,
        count: measureConceptCount,
      };
    } finally {
      abortController.abort();
    }
  });

  measureConceptsQuery: TaskInstance<{
    concepts: MobilityMeasureConcept[];
    count: number;
  }> = trackedTask(this, this.measureConceptsTask, () => [
    this.searchQuery,
    this.selectedZonality,
    this.selectedType,
    this.selectedCodeCombination,
    this.selectedCode,
    this.selectedCategory,
    this.pageNumber,
  ]);

  get measureConcepts() {
    return this.measureConceptsQuery.value?.concepts;
  }

  get measureConceptCount() {
    return this.measureConceptsQuery.value?.count;
  }

  insertMeasure = task(
    async (
      concept: MobilityMeasureConcept,
      zonality:
        | typeof ZONALITY_OPTIONS.ZONAL
        | typeof ZONALITY_OPTIONS.NON_ZONAL,
      temporal: boolean,
    ) => {
      if (!this.decisionLocation) {
        return;
      }
      const abortController = new AbortController();
      try {
        const decisionUri = this.decisionLocation.node.attrs.subject;
        const conceptTemplate = (
          await queryMobilityTemplates(this.endpoint, {
            measureConceptUri: concept.uri,
            abortSignal: abortController.signal,
          })
        )[0];
        const resolvedTemplate = await resolveTemplate(
          this.endpoint,
          conceptTemplate,
          {
            abortSignal: abortController.signal,
          },
        );
        this.controller.withTransaction(
          () => {
            return insertMeasure({
              measureConcept: concept,
              variables: resolvedTemplate.variables,
              templateString: resolvedTemplate.templateString,
              articleUriGenerator: this.args.options.articleUriGenerator,
              decisionUri,
              zonality,
              temporal,
            })(this.controller.mainEditorState).transaction;
          },
          { view: this.controller.mainEditorView },
        );
        this.args.closeModal();
      } finally {
        abortController.abort();
      }
    },
  );

  @action
  resetPagination() {
    this.goToPage(0);
  }

  @action
  goToPreviousPage() {
    this.goToPage(this.pageNumber - 1);
  }

  @action
  goToNextPage() {
    this.goToPage(this.pageNumber + 1);
  }

  @action
  goToPage(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  <template>
    <AuModal
      class='au-c-modal--flush'
      @size='large'
      @title={{t 'editor-plugins.roadsign-regulation.modal.title'}}
      @modalOpen={{@modalOpen}}
      @closeModal={{this.closeModal}}
      as |Modal|
    >
      <Modal.Body>
        <div class='au-c-body-container'>
          <div class='au-o-box au-u-background-gray-100'>
            <div class='au-o-grid au-o-grid--tiny au-o-grid--bottom'>
              <div class='au-o-grid__item au-u-1-4'>
                <AuLabel>
                  {{t 'editor-plugins.roadsign-regulation.modal.filter.type'}}
                </AuLabel>
                <PowerSelect
                  @renderInPlace={{true}}
                  {{! @glint-expect-error some type issue of ember-power-select }}
                  @verticalPosition='below'
                  @options={{this.typeOptions}}
                  @searchEnabled={{true}}
                  @searchField='label'
                  @selected={{or this.selectedType this.selectedCategory}}
                  @allowClear={{true}}
                  @onChange={{this.changeTypeOrCategory}}
                  as |option|
                >
                  {{option.label}}
                </PowerSelect>
              </div>
              <div class='au-o-grid__item au-u-1-4'>
                <AuLabel>
                  {{t 'editor-plugins.roadsign-regulation.modal.filter.code'}}
                </AuLabel>
                <PowerSelect
                  @renderInPlace={{true}}
                  {{! @glint-expect-error some type issue of ember-power-select }}
                  @verticalPosition='below'
                  @searchEnabled={{true}}
                  @search={{this.searchCodes.perform}}
                  @selected={{this.selectedCode}}
                  @allowClear={{true}}
                  @onChange={{this.changeCode}}
                  as |option|
                >
                  {{option.label}}
                </PowerSelect>
              </div>
              <div class='au-o-grid__item au-u-1-4'>
                <AuLabel>
                  {{t
                    'editor-plugins.roadsign-regulation.modal.combine-with-code'
                  }}
                </AuLabel>

                {{! WARNING: this explicit if/else works around a bug in either power-select or ember-source
                    possibly related to https://github.com/universal-ember/reactiveweb/issues/110
                    DO NOT optimize this unless you know what you're doing
                    It may seem like we can just pass codeCombinationOptions to the options
                    argument of powerselect here, but the reactivity will break and the options
                    will NOT recalculate when the main sign is selected. We have to explicitly
                    consume the value in the template and force powerselect to rerender.
                    Other tricks such as #let bindings also do not work. }}
                {{#if this.codeCombinationOptions.length}}
                  {{! @glint-expect-error some type issue of ember-power-select }}
                  <PowerSelectMultiple
                    {{! @glint-expect-error some type issue of ember-power-select }}
                    @renderInPlace={{true}}
                    @verticalPosition='below'
                    @searchEnabled={{true}}
                    @searchField='label'
                    @selected={{this.selectedCodeCombination}}
                    @allowClear={{true}}
                    @onChange={{this.changeCodeCombination}}
                    @options={{this.codeCombinationOptions}}
                    @disabled={{false}}
                    as |option|
                  >
                    {{option.label}}
                  </PowerSelectMultiple>
                {{else}}
                  {{! @glint-expect-error some type issue of ember-power-select }}
                  <PowerSelectMultiple
                    {{! @glint-expect-error some type issue of ember-power-select }}
                    @renderInPlace={{true}}
                    @verticalPosition='below'
                    @searchEnabled={{false}}
                    @selected={{this.selectedCodeCombination}}
                    @allowClear={{true}}
                    @onChange={{this.changeCodeCombination}}
                    @disabled={{true}}
                    as |option|
                  >
                    {{option.label}}
                  </PowerSelectMultiple>
                {{/if}}
              </div>
              <div class='au-o-grid__item au-u-1-4'>
                <AuLabel>
                  {{t
                    'editor-plugins.roadsign-regulation.modal.filter.zonal-validity'
                  }}
                </AuLabel>
                <PowerSelect
                  @renderInPlace={{true}}
                  {{! @glint-expect-error some type issue of ember-power-select }}
                  @verticalPosition='below'
                  @options={{this.zonalityOptions}}
                  @searchEnabled={{false}}
                  @selected={{this.selectedZonality}}
                  @allowClear={{true}}
                  @onChange={{this.changeZonality}}
                  as |option|
                >
                  {{option.label}}
                </PowerSelect>
              </div>
              <div class='au-o-grid__item au-u-1-4'>
                <AuLabel>
                  {{t 'editor-plugins.roadsign-regulation.modal.filter.text'}}
                </AuLabel>
                <AuInput
                  value={{this.searchQuery}}
                  {{on 'input' this.handleSearch}}
                />
              </div>
            </div>
          </div>
          <RoadSignsTable
            @content={{this.measureConcepts}}
            @isLoading={{this.measureConceptsQuery.isRunning}}
            @insert={{this.insertMeasure}}
            @options={{@options}}
          />
          {{#if this.measureConceptCount}}
            {{#let
              (pagination
                page=this.pageNumber
                pageSize=this.pageSize
                count=this.measureConceptCount
              )
              as |pg|
            }}
              <PaginationView
                @totalCount={{pg.count}}
                @rangeStart={{pg.pageStart}}
                @rangeEnd={{pg.pageEnd}}
                @onNextPage={{this.goToNextPage}}
                @onPreviousPage={{this.goToPreviousPage}}
                @isFirstPage={{not pg.hasPreviousPage}}
                @isLastPage={{not pg.hasNextPage}}
              />
            {{/let}}
          {{/if}}
        </div>
      </Modal.Body>
    </AuModal>
  </template>
}
