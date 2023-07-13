import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import StandardTemplatePluginService from '@lblod/ember-rdfa-editor-lblod-plugins/services/standard-template-plugin';
import { SayController } from '@lblod/ember-rdfa-editor';
import TemplateModel from '@lblod/ember-rdfa-editor-lblod-plugins/models/template';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import instantiateUuids from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin/utils/instantiate-uuids';
import { PNode, ResolvedPos } from '@lblod/ember-rdfa-editor';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  pnodeHasRdfaAttribute,
  Resource,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';

type Args = {
  controller: SayController;
};

const HACKY_LOOKUP: Record<string, Resource> = {
  'http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt': BESLUIT(
    'BehandelingVanAgendapunt',
  ),
  'http://data.vlaanderen.be/ns/besluit#Besluit': BESLUIT('Besluit'),
  'http://data.vlaanderen.be/ns/besluit#Artikel': BESLUIT('Artikel'),
};

export function findAncestors(
  pos: ResolvedPos,
  predicate: (node: PNode) => boolean = () => true,
) {
  const result: { node: PNode; pos: number }[] = [];
  let depth = pos.depth;
  while (depth >= 0) {
    const parent = pos.node(depth);
    if (predicate(parent)) {
      result.push({ node: parent, pos: pos.before(depth) });
    }
    depth -= 1;
  }
  return result;
}

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
        (template) => this.templateIsApplicable(template),
      ) || []
    );
  }

  templateIsApplicable(template: TemplateModel) {
    const { $from } = this.controller.mainEditorState.selection;
    const containsTypes =
      this.controller.externalContextStore
        .match(null, 'a')
        .dataset.some((quad) => {
          return template.contexts.includes(quad.object.value);
        }) ||
      findAncestors($from, (node) => {
        return template.contexts.some((type) =>
          pnodeHasRdfaAttribute(node, 'typeof', HACKY_LOOKUP[type]),
        );
      }).length;
    const containsDisabledTypes =
      this.controller.externalContextStore
        .match(null, 'a')
        .dataset.some((quad) => {
          return template.disabledInContexts.includes(quad.object.value);
        }) ||
      findAncestors($from, (node) => {
        return template.disabledInContexts.some((type) =>
          pnodeHasRdfaAttribute(node, 'typeof', HACKY_LOOKUP[type]),
        );
      }).length;

    return containsTypes && !containsDisabledTypes;
  }

  @action
  async insert(template: TemplateModel) {
    await template.reload();
    const selection = this.controller.mainEditorState.selection;
    let insertRange: { from: number; to: number } = selection;
    const { $from, $to } = selection;
    const isInPlaceholder =
      $from.parent.type === this.controller.schema.nodes['placeholder'] &&
      $from.sameParent($to);
    // if we would be completely replacing the contents of a simple paragraph node,
    // replace the entire node instead
    const isInSimpleParagraph =
      $from.parent.type === this.controller.schema.nodes.paragraph &&
      $from.sameParent($to) &&
      $from.pos === $from.start() &&
      $to.pos === $to.end();
    if (isInPlaceholder || isInSimpleParagraph) {
      insertRange = {
        from: $from.start($from.depth - 1),
        to: $from.end($from.depth - 1),
      };
    }
    this.controller.doCommand(
      insertHtml(
        instantiateUuids(template.body),
        insertRange.from,
        insertRange.to,
      ),
      { view: this.controller.mainEditorView },
    );
  }
}
