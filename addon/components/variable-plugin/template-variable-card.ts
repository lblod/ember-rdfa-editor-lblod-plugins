import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection, ProseParser } from '@lblod/ember-rdfa-editor';
import { ZONAL_URI } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { TemplateVariablePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin';
import { trackedFunction } from 'ember-resources/util/function';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
//@ts-expect-error tracked-toolbox has no published types yet
import { trackedReset } from 'tracked-toolbox';
type Args = {
  controller: SayController;
  options: TemplateVariablePluginOptions;
};
export default class EditorPluginsTemplateVariableCardComponent extends Component<Args> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @trackedReset('variableOptions.value') selectedVariableOption?:
    | CodeListOption
    | CodeListOption[];

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
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
    htmlToInsert = wrapVariableInHighlight(htmlToInsert);
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

  get selectedVariable() {
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      (selection.node.type === this.schema.nodes.codelist_variable ||
        selection.node.type === this.schema.nodes.location_variable)
    ) {
      return {
        node: selection.node,
        pos: selection.from,
      };
    } else {
      return;
    }
  }

  get label() {
    return this.selectedVariable?.node.attrs.label as string | undefined;
  }

  get showCard() {
    return !!this.selectedVariable;
  }

  get isLocation() {
    return (
      this.selectedVariable?.node.type === this.schema.nodes.location_variable
    );
  }

  variableOptions = trackedFunction(this, async () => {
    if (this.selectedVariable) {
      const source =
        (this.selectedVariable.node.attrs.source as string | undefined) ??
        this.args.options.endpoint;
      if (this.isLocation) {
        const { selection } = this.controller.mainEditorState;
        const roadSignRegulation = findParentNodeOfType(
          this.controller.schema.nodes.roadsign_regulation
        )(selection);
        const zonalityUri = roadSignRegulation?.node.attrs.zonality as
          | string
          | undefined;
        const variableOptions = await fetchCodeListOptions(
          source,
          zonalityUri === ZONAL_URI
            ? this.args.options.zonalLocationCodelistUri
            : this.args.options.nonZonalLocationCodelistUri
        );
        variableOptions.options = variableOptions.options.map((option) => ({
          label: option.label,
          value: wrapInLocation(unwrap(option.value)),
        }));
        return variableOptions;
      } else {
        const codelistURI = this.selectedVariable.node.attrs
          .codelistResource as string;
        return fetchCodeListOptions(source, codelistURI);
      }
    } else {
      return;
    }
  });

  get multiSelect() {
    return this.variableOptions.value?.type === MULTI_SELECT_CODELIST_TYPE;
  }

  @action
  updateVariableOption(variableOption: CodeListOption | CodeListOption[]) {
    this.selectedVariableOption = variableOption;
  }
}

function wrapVariableInHighlight(text: string) {
  return text.replace(
    /\$\{(.+?)\}/g,
    '<span class="mark-highlight-manual">${$1}</span>'
  );
}

function wrapInLocation(value: string) {
  return `
    <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
      ${value}
    </span>
  `;
}
