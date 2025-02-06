import { action } from '@ember/object';
import Component from '@glimmer/component';
import { v4 as uuid } from 'uuid';
import { service } from '@ember/service';
import includeInstructions from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/includeInstructions';
import {
  NON_ZONAL_URI,
  POTENTIALLY_ZONAL_URI,
  ZONAL_URI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/constants';
import RoadsignRegistryService from '@lblod/ember-rdfa-editor-lblod-plugins/services/roadsign-registry';
import { SayController } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { ProseParser } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { RoadsignRegulationPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';
import insertArticle from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands/insert-article-command';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/utils/build-article-structure';
import { trackedFunction } from 'reactiveweb/function';
import { tracked } from 'tracked-built-ins';
import Measure from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/models/measure';
import Sign from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/models/sign';

const PAGE_SIZE = 10;
const SIGN_TYPE_URI =
  'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept';
const ROAD_MARKING_URI =
  'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept';
const TRAFFIC_LIGHT_URI =
  'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept';
const MEASURE_TYPES = [SIGN_TYPE_URI, ROAD_MARKING_URI, TRAFFIC_LIGHT_URI];

type Option = {
  label: string;
  value: string;
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
  @service declare roadsignRegistry: RoadsignRegistryService;
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
      label: 'Zonaal',
      value: ZONAL_URI,
    },
    {
      label: 'Niet zonaal',
      value: NON_ZONAL_URI,
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
      if (MEASURE_TYPES.includes(option.value)) {
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
  searchCodes(term: string) {
    const category = this.selectedCategory?.value;
    const type = this.selectedType?.value;
    return this.roadsignRegistry.searchCode.perform(
      this.endpoint,
      term,
      category,
      type,
    );
  }

  codeCombinationOptionsQuery = trackedFunction(this, async () => {
    const selectedCode = this.selectedCode;
    if (!selectedCode) {
      return [];
    }
    let signs: string[] = [selectedCode.value];
    if (this.selectedCodeCombination) {
      signs = [...signs, ...this.selectedCodeCombination.map((s) => s.value)];
    }
    return this.roadsignRegistry.searchCode.perform(
      this.endpoint,
      undefined,
      undefined,
      undefined,
      signs,
    );
  });

  get codeCombinationOptions() {
    return this.codeCombinationOptionsQuery.value ?? [];
  }

  classificationsQuery = trackedFunction(this, async () => {
    return this.roadsignRegistry.loadClassifications.perform(this.endpoint);
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
            value: SIGN_TYPE_URI,
          },
          {
            label: 'Wegmarkeringen',
            value:
              'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept',
          },
          {
            label: 'Verkeerslichten',
            value:
              'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
          },
        ],
      },
      {
        groupName: 'Categorieën',
        options: this.classifications,
      },
    ];
  }

  measuresQuery = trackedFunction(this, async () => {
    const codes: Code[] = [];
    if (this.selectedCodeCombination) {
      codes.push(...this.selectedCodeCombination);
    }
    if (this.selectedCode) {
      codes.push(this.selectedCode);
    }
    return this.roadsignRegistry.fetchMeasures.perform(
      this.endpoint,
      this.imageBaseUrl,
      {
        previewSearchString: this.searchQuery,
        zonality: this.selectedZonality
          ? this.selectedZonality.value
          : undefined,
        type: this.selectedType ? this.selectedType.value : undefined,
        codes: codes.length ? codes.map((code) => code.value) : undefined,
        category: this.selectedCategory
          ? this.selectedCategory.value
          : undefined,
        pageNumber: this.pageNumber,
        pageSize: PAGE_SIZE,
      },
    );
  });

  get measures() {
    return this.measuresQuery.value?.measures;
  }

  get measureCount() {
    return this.measuresQuery.value?.count;
  }

  @action
  async insertHtml(
    measure: Measure,
    zonalityValue: string,
    temporalValue: string,
  ) {
    const instructions =
      await this.roadsignRegistry.fetchInstructionsForMeasure.perform(
        measure.uri,
        this.endpoint,
      );
    const zonality = zonalityValue ? zonalityValue : measure.zonality;
    const html = includeInstructions(measure.preview, instructions, true);

    const signsHTML = measure.signs
      .map((sign) => {
        const roadSignUri = 'http://data.lblod.info/verkeerstekens/' + uuid();
        const trafficSignPrefix = this.addTrafficSignPrefix(sign);
        return /** html */ `
        <li>
          <span
            property="mobiliteit:wordtAangeduidDoor"
            resource=${roadSignUri}
            typeof="mobiliteit:Verkeersbord-Verkeersteken"
          >
            <span
              property="mobiliteit:heeftVerkeersbordconcept"
              resource="${sign.uri}"
              typeof="mobiliteit:Verkeersbordconcept"
            >
              <span
                property="skos:prefLabel"
              >
                ${trafficSignPrefix} ${sign.code}
              </span>
              ${
                sign.zonality === POTENTIALLY_ZONAL_URI &&
                zonality === ZONAL_URI
                  ? ' met zonale geldigheid'
                  : ''
              }
            </span>
          </span>
        </li>`;
      })
      .join('\n');
    const regulationHTML = `<div
        property="mobiliteit:heeftVerkeersmaatregel"
        resource="http://data.lblod.info/mobiliteitsmaatregels/${uuid()}"
        typeof="mobiliteit:Mobiliteitsmaatregel"
      >
        <span
          property="prov:wasDerivedFrom"
          resource="${measure.uri}"
        />
        <span
          property="ext:zonality"
          resource="${zonality}"
        />
        <span
          property="ext:temporal"
          value="${measure.temporal.toString()}"
        />
        <div property="dct:description">
          ${html}
          <p>Dit wordt aangeduid door verkeerstekens:</p>
          <ul>
            ${signsHTML}
          </ul>
          ${temporalValue === 'true' ? 'Deze signalisatie is dynamisch.' : ''}
        </div>
      </div>
    `;
    console.log('Regulation to insert: ', regulationHTML);
    const domParser = new DOMParser();
    const htmlNode = domParser.parseFromString(regulationHTML, 'text/html');
    const passedDecisionUri = this.args.options.decisionContext?.decisionUri;
    const article = buildArticleStructure(
      this.controller.activeEditorState.schema,
      this.args.options.articleUriGenerator ??
        this.args.options.articleUriGenrator,
      this.args.options.decisionContext?.decisionUri,
    );
    const contentFragment = ProseParser.fromSchema(
      this.args.controller.schema,
    ).parseSlice(htmlNode, {
      preserveWhitespace: false,
    }).content;
    const nodeToInsert = article.copy(contentFragment);

    const insertArgs: Parameters<typeof insertArticle>[0] = passedDecisionUri
      ? { node: nodeToInsert, insertFreely: true }
      : { node: nodeToInsert, decisionLocation: unwrap(this.decisionLocation) };
    this.args.controller.doCommand(insertArticle(insertArgs), {
      view: this.args.controller.mainEditorView,
    });
    this.args.closeModal();
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
