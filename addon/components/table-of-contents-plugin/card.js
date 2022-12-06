import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class TableOfContentsCardComponent extends Component {
  @tracked toggled;

  constructor() {
    super(...arguments);
    this.toggled = this.tableOfContentsInstances.length !== 0;
    this.args.controller.onEvent('modelWritten', () => {
      this.toggled = this.tableOfContentsInstances.length !== 0;
    });
  }

  get tableOfContentsInstances() {
    return this.args.controller.getComponentInstances({
      componentName:
        'table-of-contents-plugin/inline-components/table-of-contents',
    });
  }

  get tableOfContentsProps() {
    return this.args.widgetArgs.config
      ? { config: this.args.widgetArgs.config }
      : {};
  }

  @action
  toggle() {
    if (this.toggled) {
      // Remove instances from table of contents
      this.tableOfContentsInstances.forEach((instance) => {
        const model = instance.componentController.model;
        this.args.controller.executeCommand('remove-component', model);
      });
    } else {
      // Add table of contents
      this.args.controller.executeCommand(
        'insert-component',
        'table-of-contents-plugin/inline-components/table-of-contents',
        this.tableOfContentsProps,
        false,
        this.args.controller.rangeFactory.fromInElement(
          this.args.controller.modelRoot,
          0,
          0
        )
      );
    }
  }
}
