import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection, PNode, ProseParser } from '@lblod/ember-rdfa-editor';
import { ZONAL_URI } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { TemplateVariablePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin';

type Args = {
  controller: SayController;
  options: TemplateVariablePluginOptions;
};
export default class EditorPluginsTemplateVariableCardComponent extends Component<Args> {
  @tracked variableOptions: CodeListOption[] = [];
  @tracked selectedVariableOption?: CodeListOption | CodeListOption[];
  @tracked selectedVariable: { pos: number; node: PNode } | undefined;
  @tracked showCard = false;
  @tracked multiSelect = false;
  mappingUri?: string;

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
    this.controller.withTransaction(
      (tr) => {
        return tr.replaceWith(range.from, range.to, contentFragment);
      },
      { view: this.controller.mainEditorView }
    );
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
    const { selection } = this.controller.mainEditorState;
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
            (variable.node.attrs.source as string | undefined) ??
            this.args.options.endpoint;
          const codelistURI = variable.node.attrs.codelistResource as string;
          void this.fetchCodeListOptions.perform(source, codelistURI);
          this.showCard = true;
        } else if (type === 'location') {
          const source =
            (variable.node.attrs.source as string | undefined) ??
            this.args.options.endpoint;
          const roadSignRegulation = findParentNodeOfType(
            this.controller.schema.nodes.roadsign_regulation
          )(selection);
          const zonalityUri = roadSignRegulation?.node.attrs.zonality as
            | string
            | undefined;
          if (zonalityUri === ZONAL_URI) {
            void this.fetchCodeListOptions.perform(
              source,
              this.args.options.zonalLocationCodelistUri,
              true
            );
          } else {
            void this.fetchCodeListOptions.perform(
              source,
              this.args.options.nonZonalLocationCodelistUri,
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
}
