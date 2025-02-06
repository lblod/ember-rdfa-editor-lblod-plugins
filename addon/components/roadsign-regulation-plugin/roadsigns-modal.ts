import { action } from '@ember/object';
import Component from '@glimmer/component';
import { service } from '@ember/service';
import {
  NON_ZONAL_URI,
  ZONAL_URI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/constants';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { RoadsignRegulationPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import { trackedFunction } from 'reactiveweb/function';
import { tracked } from 'tracked-built-ins';
import Sign from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/schemas/sign-concept';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';
import { restartableTask, timeout } from 'ember-concurrency';
import querySignCodes from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/sign-codes';
import queryRoadSignCategories from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/road-sign-category';
import { MobilityMeasureConcept } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/schemas/mobility-measure-concept';
import { TaskInstance, trackedTask } from 'reactiveweb/ember-concurrency';
import {
  countMobilityMeasures,
  queryMobilityMeasures,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/queries/mobility-measure-concept';

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

type Args = {
  closeModal: () => void;
  controller: SayController;
  options: RoadsignRegulationPluginOptions;
};

export default class RoadsignsModal extends Component<Args> {
  @service declare intl: IntlService;

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
    console.log('Fetch code combinations!');
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
  addTrafficSignPrefix(sign: Sign) {
    let trafficSignPrefix;
    switch (sign.type) {
      case 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept':
        trafficSignPrefix = 'Verkeersbord';
        break;
      case 'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept':
        trafficSignPrefix = 'Wegmarkering van artikel';
        break;
      case 'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept':
        trafficSignPrefix = 'Verkeerslicht van artikel';
        break;
    }
    return trafficSignPrefix;
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
}
