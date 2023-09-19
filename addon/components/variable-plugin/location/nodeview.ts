import Component from '@glimmer/component';
import { SayController, SayView } from '@lblod/ember-rdfa-editor';
import { tracked } from '@glimmer/tracking';
import { addressView } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';

type Args = {
  controller: SayController;
};

export default class LocationNodeViewComponent extends Component<Args> {
  @tracked nodeViews = {
    address: addressView(this.args.controller),
  };
  @tracked innerView?: SayView;
}
