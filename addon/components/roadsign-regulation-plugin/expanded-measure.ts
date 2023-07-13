import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  NON_ZONAL_URI,
  POTENTIALLY_ZONAL_URI,
  ZONAL_URI,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/constants';
import Measure from '@lblod/ember-rdfa-editor-lblod-plugins/models/measure';
import { assert } from '@ember/debug';

type Args = {
  measure: Measure;
  selectRow: (uri: string) => void;
  insert: (
    measure: Measure,
    zonalityValue?: string,
    temporalValue?: string,
  ) => void;
};

export default class ExpandedMeasureComponent extends Component<Args> {
  @tracked zonalityValue?: string;
  @tracked temporalValue?: string;
  ZONAL_URI = ZONAL_URI;
  NON_ZONAL_URI = NON_ZONAL_URI;
  get isPotentiallyZonal() {
    return this.args.measure.zonality === POTENTIALLY_ZONAL_URI;
  }
  get insertButtonDisabled() {
    return this.isPotentiallyZonal && !this.zonalityValue;
  }

  @action
  changeZonality(event: InputEvent) {
    assert(
      'changeZonalityValue must be bound to an input element',
      event.target instanceof HTMLInputElement,
    );
    this.zonalityValue = event.target.value;
  }
  @action
  changeTemporality(event: InputEvent) {
    assert(
      'changeTemporality must be bound to an input element',
      event.target instanceof HTMLInputElement,
    );
    this.temporalValue = event.target.value;
  }
  @action
  insert() {
    this.args.insert(this.args.measure, this.zonalityValue, this.temporalValue);
  }
  @action
  unselectRow() {
    this.args.selectRow(this.args.measure.uri);
  }
}
