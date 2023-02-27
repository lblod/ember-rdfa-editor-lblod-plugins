import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

type Args = Record<string, never>;
export default class RoadsignsTable extends Component<Args> {
  @tracked selected?: string;
  imageBaseUrl: string;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    const config = unwrap(getOwner(this)).resolveRegistration(
      'config:environment'
    ) as {
      roadsignRegulationPlugin: {
        imageBaseUrl: string;
      };
    };
    this.imageBaseUrl = config.roadsignRegulationPlugin.imageBaseUrl;
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
