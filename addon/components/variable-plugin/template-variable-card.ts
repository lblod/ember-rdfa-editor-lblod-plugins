import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import {
  CodeListOption,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection, PNode, ProseParser } from '@lblod/ember-rdfa-editor';
import { ZONAL_URI } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/constants';
import { A } from '@ember/array';

type Args = {
  controller: ProseController;
};
export default class EditorPluginsTemplateVariableCardComponent extends Component<Args> {
  @tracked variableOptions: CodeListOption[] = [];
  @tracked selectedVariableOption?: CodeListOption | CodeListOption[];
  @tracked selectedVariable: { pos: number; node: PNode } | undefined;
  @tracked showCard = false;
  @tracked multiSelect = false;
  @tracked multiModeModalOpen = false;
  @tracked multiModeSelections: CodeListOption[] = A([]);
  @tracked selectedMultiOption?: CodeListOption;
  mappingUri?: string;
  zonalLocationCodelistUri: string;
  endpoint: string;
  nonZonalLocationCodelistUri: string;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    const config = getOwner(this)?.resolveRegistration(
      'config:environment'
    ) as {
      templateVariablePlugin: {
        zonalLocationCodelistUri: string;
        endpoint: string;
        nonZonalLocationCodelistUri: string;
      };
    };
    const pluginConfig = config.templateVariablePlugin;
    this.zonalLocationCodelistUri = pluginConfig.zonalLocationCodelistUri;
    this.endpoint = pluginConfig.endpoint;
    this.nonZonalLocationCodelistUri = pluginConfig.nonZonalLocationCodelistUri;
  }

  get controller() {
    return this.args.controller;
  }

  @action
  insert() {
    if (!this.selectedVariable || !this.selectedVariableOption) {
      return;
    }
    let htmlToInsert: string;
    if (Array.isArray(this.selectedVariableOption)) {
      htmlToInsert = this.selectedVariableOption
        .map((variable) => variable.value)
        .join(', ');
    } else {
      htmlToInsert = unwrap(this.selectedVariableOption.value);
    }
    htmlToInsert = this.wrapVariableInHighlight(htmlToInsert);
    const domParser = new DOMParser();
    const htmlNode = domParser.parseFromString(htmlToInsert, 'text/html');
    const contentFragment = ProseParser.fromSchema(
      this.args.controller.schema
    ).parseSlice(htmlNode, {
      preserveWhitespace: false,
    }).content;
    const range = {
      from: this.selectedVariable.pos + 1,
      to: this.selectedVariable.pos + this.selectedVariable.node.nodeSize - 1,
    };
    this.controller.withTransaction((tr) => {
      return tr.replaceWith(range.from, range.to, contentFragment);
    });
  }

  wrapVariableInHighlight(text: string) {
    return text.replace(
      /\$\{(.+?)\}/g,
      '<span class="mark-highlight-manual">${$1}</span>'
    );
  }

  @action
  selectionChanged() {
    this.showCard = false;
    this.selectedVariableOption = undefined;
    const { selection } = this.controller.state;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.controller.schema.nodes.variable
    ) {
      const variable = {
        node: selection.node,
        pos: selection.from,
      };
      this.selectedVariable = variable;
      if (variable) {
        const type = variable.node.attrs.type as string;
        if (type === 'codelist') {
          const source =
            (variable.node.attrs.source as string | undefined) ?? this.endpoint;
          const codelistURI = variable.node.attrs.codelistResource as string;
          void this.fetchCodeListOptions.perform(source, codelistURI);
          this.showCard = true;
        } else if (type === 'location') {
          const source =
            (variable.node.attrs.source as string | undefined) ?? this.endpoint;
          const roadSignRegulation = findParentNodeOfType(
            this.controller.schema.nodes.roadsign_regulation
          )(selection);
          const zonalityUri = roadSignRegulation?.node.attrs.zonality as
            | string
            | undefined;
          if (zonalityUri === ZONAL_URI) {
            void this.fetchCodeListOptions.perform(
              source,
              this.zonalLocationCodelistUri,
              true
            );
          } else {
            void this.fetchCodeListOptions.perform(
              source,
              this.nonZonalLocationCodelistUri,
              true
            );
          }

          this.showCard = true;
        }
      }
    }
  }

  @action
  updateVariableOption(variableOption: CodeListOption | CodeListOption[]) {
    this.selectedVariableOption = variableOption;
  }

  fetchCodeListOptions = task(
    async (endpoint: string, codelistUri: string, isLocation?: boolean) => {
      const { type, options } = await fetchCodeListOptions(
        endpoint,
        codelistUri
      );
      if (isLocation) {
        this.variableOptions = options.map((option) => ({
          label: option.label,
          value: this.wrapInLocation(unwrap(option.value)),
        }));
      } else {
        this.variableOptions = options;
      }
      if (type === MULTI_SELECT_CODELIST_TYPE) {
        this.multiSelect = true;
      } else {
        this.multiSelect = false;
      }
    }
  );

  wrapInLocation(value: string) {
    return `
      <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
        ${value}
      </span>
    `;
  }

  @action
  toggleMultiModeModal() {
    this.multiModeModalOpen = !this.multiModeModalOpen;
    this.multiModeSelections = A([]);
    this.selectedMultiOption = undefined;
  }

  @action
  updateMultiOptionSelect(variableOption: CodeListOption) {
    this.selectedMultiOption = variableOption;
  }

  @action
  addToMultiModeSelections() {
    console.log(this.selectedMultiOption);
    if (this.selectedMultiOption) {
      this.multiModeSelections.pushObject(this.selectedMultiOption);
    }
    console.log(this.multiModeSelections);
  }

  @action
  insertMultiMode() {
    this.selectedVariableOption = this.multiModeSelections;
    this.insert();
    this.toggleMultiModeModal();
  }

  @action
  deleteFromMultiModeSelection(index: number) {
    this.multiModeSelections.removeAt(index);
  }

  @action
  moveMultiModeSelection(direction: 'up' | 'down', index: number) {
    if (direction === 'up') {
      const objects = [
        this.multiModeSelections[index],
        this.multiModeSelections[index - 1],
      ];
      this.multiModeSelections.replace(index - 1, 2, objects);
    } else {
      const objects = [
        this.multiModeSelections[index + 1],
        this.multiModeSelections[index],
      ];
      this.multiModeSelections.replace(index, 2, objects);
    }
    
  }
}
