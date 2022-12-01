import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import instantiateUuids from '../../utils/instantiate-uuids';

export default class TemplateProviderComponent extends Component {
  @service standardTemplatePlugin;
  @tracked applicableTemplates = [];

  constructor() {
    super(...arguments);
    this.args.controller.onEvent('selectionChanged', this.trackSelectionChange);
  }

  get busy() {
    return this.standardTemplatePlugin.fetchTemplates.isRunning;
  }

  get controller() {
    return this.args.controller;
  }

  get hasApplicableTemplates() {
    return this.applicableTemplates.length > 0;
  }

  templateIsApplicable(template) {
    const selectedRange = this.controller.selection.lastRange;
    if (!selectedRange) {
      return false;
    }
    const rangeStore = this.controller.datastore.limitToRange(
      selectedRange,
      'rangeIsInside'
    );

    const containsTypes = rangeStore.match(null, 'a').dataset.some((quad) => {
      return template.contexts.includes(quad.object.value);
    });

    const containsDisabledTypes = rangeStore
      .match(null, 'a')
      .dataset.some((quad) =>
        template.disabledInContexts.includes(quad.object.value)
      );

    return containsTypes && !containsDisabledTypes;
  }

  @action
  trackSelectionChange() {
    this.applicableTemplates =
      this.standardTemplatePlugin.fetchTemplates.last.value?.filter(
        (template) => this.templateIsApplicable(template)
      ) || [];
  }

  @action
  async insert(template) {
    await template.reload();
    let insertRange = this.controller.selection.lastRange;
    if (insertRange.getMarks().hasMarkName('highlighted')) {
      insertRange = this.controller.rangeFactory.fromAroundNode(
        insertRange.getCommonAncestor()
      );
    }
    this.controller.executeCommand(
      'insert-html',
      instantiateUuids(template.body),
      insertRange,
      'right'
    );
  }
}
