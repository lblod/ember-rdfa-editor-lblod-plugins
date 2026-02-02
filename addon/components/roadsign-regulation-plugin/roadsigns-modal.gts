import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';

import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import { RoadsignRegulationPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';
import {
  countMobilityMeasures,
  MobilityMeasureQueryOptions,
  queryMobilityMeasures,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/mobility-measure-concept';
import queryRoadSignCategories from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/road-sign-category';
import queryTrafficSignalCodes from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/traffic-signal-codes';
import { MobilityMeasureConcept } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/schemas/mobility-measure-concept';
import { pagination } from '@lblod/ember-rdfa-editor-lblod-plugins/helpers/pagination';
import { restartableTask, task, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import PowerSelect, {
  Select,
} from 'ember-power-select/components/power-select';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import { TaskInstance, trackedTask } from 'reactiveweb/ember-concurrency';
import { trackedFunction } from 'reactiveweb/function';
import RoadSignsTable from './roadsigns-table';
import PaginationView from '../pagination/pagination-view';
import { not, or } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import {
  TRAFFIC_SIGNAL_CONCEPT_TYPES,
  ZONALITY_OPTIONS,
  type ZonalOrNot,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/constants';
import { resolveTemplate } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/actions/resolve-template';
import { queryMobilityTemplates } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/mobility-template';
import insertMeasure from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/actions/insert-measure';
import { Variable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/schemas/variable';
import { generateVariableInstanceUri } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/variable-helpers';
import { mapObject } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/map-object';

type Option = {
  uri: string;
  label: string;
};

type Zonality = {
  uri: (typeof ZONALITY_OPTIONS)[keyof typeof ZONALITY_OPTIONS];
  label: string;
};
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
        (
          this.trafficSignalConceptTypes.map((type) => type.uri) as string[]
        ).includes(option.uri)
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

  @action
  doFirstCodeSearch(select: Select) {
    if (
      this.searchCodes.isIdle &&
      !select.searchText &&
      // @ts-expect-error not part of the public API... (tested on PS 7 and 8)
      this.searchCodes.lastSuccessful?.args?.[0] !== ''
    ) {
      this.searchCodes.perform('');
    }
    return true;
  }
  searchCodes = restartableTask(async (term: string) => {
    const category = this.selectedCategory?.uri;
    const type = this.selectedType?.uri;
    const types = type ? [type] : undefined;
    await timeout(DEBOUNCE_MS);
    const abortController = new AbortController();
    try {
      return queryTrafficSignalCodes(this.endpoint, {
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
    let combinedWith: string[] = [selectedCode.uri];
    if (this.selectedCodeCombination) {
      combinedWith = [
        ...combinedWith,
        ...this.selectedCodeCombination.map((s) => s.uri),
      ];
    }
    return queryTrafficSignalCodes(this.endpoint, {
      combinedWith,
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

  trafficSignalConceptTypes = [
    {
      label: 'Verkeersborden',
      uri: TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN,
    },
    {
      label: 'Wegmarkeringen',
      uri: TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
    },
    {
      label: 'Verkeerslichten',
      uri: TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
    },
  ];

  get typeOptions(): {
    groupName: string;
    options: TypeOption[];
  }[] {
    return [
      {
        groupName: 'Types',
        options: this.trafficSignalConceptTypes,
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
    const queryOptions: MobilityMeasureQueryOptions = {
      imageBaseUrl: this.imageBaseUrl,
      searchString: this.searchQuery,
      zonality: this.selectedZonality ? this.selectedZonality.uri : undefined,
      trafficSignalType: this.selectedType ? this.selectedType.uri : undefined,
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
      zonality: ZonalOrNot,
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
        const variableInstances = mapObject(
          resolvedTemplate.variables,
          ([key, variableOrVariableInstance]) => {
            return [key, instantiateVariable(variableOrVariableInstance)];
          },
        );
        this.controller.withTransaction(
          () => {
            return insertMeasure({
              measureConcept: concept,
              variables: variableInstances,
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
                  @verticalPosition='below'
                  @searchEnabled={{true}}
                  @search={{this.searchCodes.perform}}
                  @options={{or this.searchCodes.last.value undefined}}
                  @selected={{this.selectedCode}}
                  @allowClear={{true}}
                  @onChange={{this.changeCode}}
                  @onOpen={{this.doFirstCodeSearch}}
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
                  <PowerSelectMultiple
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
                  <PowerSelectMultiple
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

function instantiateVariable(
  variable: Exclude<Variable, { type: 'instruction' }>,
) {
  switch (variable.type) {
    case 'text':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        variable,
      };
    case 'number':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        variable,
      };
    case 'date':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        variable,
      };
    case 'location':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        variable,
      };
    case 'codelist':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        valueLabel: variable.defaultValueLabel,
        variable,
      };
  }
}
