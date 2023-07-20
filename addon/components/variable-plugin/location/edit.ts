import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection, ProseParser } from '@lblod/ember-rdfa-editor';
import { ZONAL_URI } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { trackedFunction } from 'ember-resources/util/function';
import { trackedReset } from 'tracked-toolbox';

export type LocationEditOptions = {
  endpoint: string;
  zonalLocationCodelistUri: string;
  nonZonalLocationCodelistUri: string;
};
type Args = {
  controller: SayController;
  options: LocationEditOptions;
};
export default class LocationEditComponent extends Component<Args> {
  @trackedReset('locationOptions.value') selectedLocationOption?:
    | CodeListOption
    | CodeListOption[];

  get controller() {
    return this.args.controller;
  }

  get options() {
    return this.args.options;
  }

  @action
  insert() {
    if (!this.selectedLocation || !this.selectedLocationOption) {
      return;
    }
    let htmlToInsert: string;
    if (Array.isArray(this.selectedLocationOption)) {
      htmlToInsert = this.selectedLocationOption
        .map((option) => option.value)
        .join(', ');
    } else {
      htmlToInsert = unwrap(this.selectedLocationOption.value);
    }
    htmlToInsert = this.wrapVariableInHighlight(htmlToInsert);
    const domParser = new DOMParser();
    const htmlNode = domParser.parseFromString(htmlToInsert, 'text/html');
    const contentFragment = ProseParser.fromSchema(
      this.controller.schema,
    ).parseSlice(htmlNode, {
      preserveWhitespace: false,
    }).content;
    const range = {
      from: this.selectedLocation.pos + 1,
      to: this.selectedLocation.pos + this.selectedLocation.node.nodeSize - 1,
    };
    this.controller.withTransaction(
      (tr) => {
        return tr.replaceWith(range.from, range.to, contentFragment);
      },
      { view: this.controller.mainEditorView },
    );
  }

  wrapVariableInHighlight(text: string) {
    return text.replace(
      /\$\{(.+?)\}/g,
      '<span class="mark-highlight-manual">${$1}</span>',
    );
  }

  get selectedLocation() {
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.controller.schema.nodes.location
    ) {
      return {
        node: selection.node,
        pos: selection.from,
      };
    } else {
      return;
    }
  }

  get showCard() {
    return !!this.selectedLocation;
  }

  get source() {
    return (
      (this.selectedLocation?.node.attrs.source as string | undefined) ??
      this.args.options.endpoint
    );
  }

  get label() {
    return this.selectedLocation?.node.attrs.label as string | undefined;
  }

  get isZonal() {
    const { selection } = this.controller.mainEditorState;
    const roadSignRegulation = findParentNodeOfType(
      this.controller.schema.nodes.roadsign_regulation,
    )(selection);
    const zonalityUri = roadSignRegulation?.node.attrs.zonality as
      | string
      | undefined;
    return zonalityUri === ZONAL_URI;
  }

  locationOptions = trackedFunction(this, async () => {
    const result = await fetchCodeListOptions(
      this.source,
      this.isZonal
        ? this.options.zonalLocationCodelistUri
        : this.options.nonZonalLocationCodelistUri,
    );
    result.options = result.options.map((option) => ({
      label: option.label,
      value: this.wrapInLocation(unwrap(option.value)),
    }));
    return result;
  });

  get multiSelect() {
    return this.locationOptions.value?.type === MULTI_SELECT_CODELIST_TYPE;
  }

  @action
  updateLocationOption(locationOption: CodeListOption | CodeListOption[]) {
    this.selectedLocationOption = locationOption;
  }

  wrapInLocation(value: string) {
    return `
      <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
        ${value}
      </span>
    `;
  }
}
