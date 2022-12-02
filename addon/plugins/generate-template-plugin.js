import GenerateTemplateCommand from '../commands/generate-template-command';

export default class GenerateTemplatePlugin {
  controller;

  get name() {
    return 'generate-template-plugin';
  }

  initialize(controller) {
    this.controller = controller;
    controller.registerCommand(
      new GenerateTemplateCommand(controller._rawEditor._model)
    );
  }
}
