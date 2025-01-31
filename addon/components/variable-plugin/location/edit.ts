import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { ZONAL_URI } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { trackedFunction } from 'reactiveweb/function';
import { updateCodelistVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/codelist-utils';
import { tracked } from '@glimmer/tracking';

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
  @tracked selectedLocationOption?: CodeListOption | CodeListOption[];

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
      value: unwrap(option.value),
    }));
    // This a workaround/hack to be able to reset the `selected` option after the `locationOptions` change.
    // Normally we'd do this with a `trackedReset`, but this gave us `write-after-read` dev-errors at the time of writing this.
    // TODO: convert this back to a `trackedReset` (or an alternative) once possible.
    this.selectedLocationOption = undefined;
    return result;
  });

  get multiSelect() {
    return this.locationOptions.value?.type === MULTI_SELECT_CODELIST_TYPE;
  }

  @action
  updateLocationOption(locationOption: CodeListOption | CodeListOption[]) {
    this.selectedLocationOption = locationOption;
  }
}
