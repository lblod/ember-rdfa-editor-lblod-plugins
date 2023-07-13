import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import includeInstructions from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/utils/includeInstructions';
import RoadsignRegistryService from '@lblod/ember-rdfa-editor-lblod-plugins/services/roadsign-registry';

type Args = {
  template: string;
  measure: string;
  annotated: boolean;
  endpoint: string;
};
export default class MeasureTemplateComponent extends Component<Args> {
  @service declare roadsignRegistry: RoadsignRegistryService;
  @tracked template = '';
  endpoint: string;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    this.template = this.args.template;
    void this.fetchData.perform();
    this.endpoint = this.args.endpoint;
  }

  fetchData = task(async () => {
    const instructions =
      await this.roadsignRegistry.getInstructionsForMeasure.perform(
        this.args.measure,
        this.endpoint,
      );
    const template = includeInstructions(
      this.args.template,
      instructions,
      this.args.annotated,
    );
    this.template = template;
  });
}
