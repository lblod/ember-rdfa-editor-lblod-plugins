import Component from '@glimmer/component';
import { action } from '@ember/object';
import { RdfaAttrs, SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { ZONAL_URI } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/constants';
import {
  Option,
  unwrap,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { trackedFunction } from 'ember-resources/util/function';
import { trackedReset } from 'tracked-toolbox';
import { updateCodelistVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/codelist-utils';
import { getParsedRDFAAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { DCT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

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
    updateCodelistVariable(
      this.selectedLocation,
      this.selectedLocationOption,
      this.controller,
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
    const node = this.selectedLocation?.node;
    if (node) {
      const source = getParsedRDFAAttribute(
        node.attrs as RdfaAttrs,
        DCT('source'),
      )?.object as Option<string>;
      if (source) {
        return source;
      }
    }
    return this.args.options.endpoint;
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
