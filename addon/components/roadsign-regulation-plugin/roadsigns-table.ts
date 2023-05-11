import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { RoadsignRegulationPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin';

type Args = {
  controller: SayController;
  options: RoadsignRegulationPluginOptions;
};

export default class RoadsignsTable extends Component<Args> {
  @tracked selected?: string;
  imageBaseUrl: string;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    this.imageBaseUrl = args.options.imageBaseUrl;
  }

  @action
  selectRow(id: string) {
    if (this.selected === id) {
      this.selected = undefined;
    } else {
      this.selected = id;
    }
  }
}
