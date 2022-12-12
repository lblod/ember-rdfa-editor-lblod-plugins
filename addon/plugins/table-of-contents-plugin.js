// import TableOfContentsSpec from '../inline-components/table-of-contents';

export default class TableOfContentsPlugin {
  controller;

  get name() {
    return 'table-of-contents-plugin';
  }

  initialize(controller, options) {
    this.controller = controller;
    // controller.registerInlineComponent(
    //   new TableOfContentsSpec(this.controller)
    // );
    const widgetArgs = options?.config
      ? {
          config: options.config,
        }
      : {};
    controller.registerWidget({
      componentName: 'table-of-contents-plugin/card',
      identifier: 'table-of-contents-plugin/card',
      desiredLocation: 'sidebar',
      widgetArgs,
    });
  }
}
