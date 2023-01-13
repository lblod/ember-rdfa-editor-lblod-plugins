import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Variable extends Component {
  @tracked
  showModal = false;

  onClick = () => {
    this.showModal = true;
  };
}
