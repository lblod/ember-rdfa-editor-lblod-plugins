import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import includeInstructions from '../../utils/roadsign-regulation-plugin/includeInstructions';

export default class MeasureTemplateComponent extends Component {
  @service roadsignRegistry;
  @tracked template = '';

  constructor() {
    super(...arguments);
    this.template = this.args.template;
    this.fetchData.perform();
  }

  @task
  *fetchData() {
    const instructions =
      yield this.roadsignRegistry.getInstructionsForMeasure.perform(
        this.args.measure
      );
    let template = includeInstructions(
      this.args.template,
      instructions,
      this.args.annotated
    );
    this.template = template;
  }
}
