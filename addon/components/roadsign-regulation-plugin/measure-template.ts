import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import includeInstructions from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/includeInstructions';
import RoadsignRegistryService from '@lblod/ember-rdfa-editor-lblod-plugins/services/roadsign-registry';
import { trackedFunction } from 'ember-resources/util/function';

type Args = {
  template: string;
  measure: string;
  annotated: boolean;
  endpoint: string;
};
export default class MeasureTemplateComponent extends Component<Args> {
  @service declare roadsignRegistry: RoadsignRegistryService;

  get template() {
    return this.instructionData.value ?? '';
  }

  instructionData = trackedFunction(this, async () => {
    const instructions =
      await this.roadsignRegistry.getInstructionsForMeasure.perform(
        this.args.measure,
        this.args.endpoint
      );
    const template = includeInstructions(
      this.args.template,
      instructions,
      this.args.annotated
    );
    return template;
  });
}
