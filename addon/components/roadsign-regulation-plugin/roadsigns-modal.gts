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
  NON_ZONAL_URI,
  ZONAL_URI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/constants';
import {
  countMobilityMeasures,
  queryMobilityMeasures,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/mobility-measure-concept';
import queryRoadSignCategories from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/road-sign-category';
import querySignCodes from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/sign-codes';
import { MobilityMeasureConcept } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/schemas/mobility-measure-concept';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';
import { pagination } from 'dummy/helpers/pagination';
import { restartableTask, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import PowerSelect from 'ember-power-select/components/power-select';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import { TaskInstance, trackedTask } from 'reactiveweb/ember-concurrency';
import { trackedFunction } from 'reactiveweb/function';
import RoadSignsTable from './roadsigns-table';
import PaginationView from '../pagination/pagination-view';
import { not, or } from 'ember-truth-helpers';
import { on } from '@ember/modifier';

const DEBOUNCE_MS = 100;
const PAGE_SIZE = 10;
const SIGN_TYPE_URI =
  'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept';
const ROAD_MARKING_URI =
  'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept';
const TRAFFIC_LIGHT_URI =
  'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept';
const MEASURE_TYPES = [SIGN_TYPE_URI, ROAD_MARKING_URI, TRAFFIC_LIGHT_URI];

type Option = {
  uri: string;
  label: string;
};

type Zonality = Option;
type TypeOption = Option;
type Code = Option;
type Category = Option;

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
      uri: ZONAL_URI,
      label: 'Zonaal',
    },
    {
      uri: NON_ZONAL_URI,
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
      if (MEASURE_TYPES.includes(option.uri)) {
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
    await timeout(DEBOUNCE_MS);
    const types = type ? [type] : undefined;
    return querySignCodes(this.endpoint, {
      searchString: term,
      roadSignCategory: category,
      types,
    });
  });

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

  get typeOptions(): {
    groupName: string;
    options: TypeOption[];
  }[] {
    return [
      {
        groupName: 'Types',
        options: [
          {
            label: 'Verkeersborden',
            uri: SIGN_TYPE_URI,
          },
          {
            label: 'Wegmarkeringen',
            uri: 'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept',
          },
          {
            label: 'Verkeerslichten',
            uri: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
          },
        ],
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
    await timeout(DEBOUNCE_MS);
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
    const [measureConcepts, measureConceptCount] = await Promise.all([
      queryMobilityMeasures(this.endpoint, queryOptions),
      countMobilityMeasures(this.endpoint, queryOptions),
    ]);
    return {
      concepts: measureConcepts,
      count: measureConceptCount,
    };
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

  @action
  insertHtml(
    _measure: MobilityMeasureConcept,
    _zonalityValue: string,
    _temporalValue: string,
  ) {
    throw new NotImplementedError();
  }

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
                  @disabled={{not this.selectedCode}}
                  as |option|
                >
                  {{option.label}}
                </PowerSelectMultiple>
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
            @insert={{this.insertHtml}}
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
