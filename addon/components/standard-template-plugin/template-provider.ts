import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import StandardTemplatePluginService from '@lblod/ember-rdfa-editor-lblod-plugins/services/standard-template-plugin';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import TemplateModel from '@lblod/ember-rdfa-editor-lblod-plugins/models/template';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import instantiateUuids from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin/utils/instantiate-uuids';

type Args = {
  controller: ProseController;
};
export default class TemplateProviderComponent extends Component<Args> {
  @service declare standardTemplatePlugin: StandardTemplatePluginService;

  get busy() {
    return this.standardTemplatePlugin.fetchTemplates.isRunning;
  }

  get controller() {
    return this.args.controller;
  }

  get hasApplicableTemplates() {
    return this.applicableTemplates.length > 0;
  }

  get applicableTemplates() {
    return (
      this.standardTemplatePlugin.fetchTemplates.last?.value?.filter(
        (template) => this.templateIsApplicable(template)
      ) || []
    );
  }

  templateIsApplicable(template: TemplateModel) {
    const containsTypes = this.controller.datastore
      .match(null, 'a')
      .dataset.some((quad) => {
        return template.contexts.includes(quad.object.value);
      });

    const containsDisabledTypes = this.controller.datastore
      .match(null, 'a')
      .dataset.some((quad) =>
        template.disabledInContexts.includes(quad.object.value)
      );

    return containsTypes && !containsDisabledTypes;
  }

  @action
  async insert(template: TemplateModel) {
    await template.reload();
    const selection = this.controller.state.selection;
    let insertRange: { from: number; to: number } = selection;
    const { $from, $to } = selection;
    if (
      $from.parent.type === this.controller.schema.nodes['placeholder'] &&
      $from.sameParent($to)
    ) {
      insertRange = {
        from: $from.start($from.depth - 1),
        to: $from.end($from.depth - 1),
      };
    }
    this.controller.doCommand(
      insertHtml(
        instantiateUuids(template.body),
        insertRange.from,
        insertRange.to
      )
    );
  }
}
