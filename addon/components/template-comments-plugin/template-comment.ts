import Component from '@glimmer/component';
import { PluginConfig, inputRules } from '@lblod/ember-rdfa-editor';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  bullet_list_input_rule,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { baseKeymap } from '@lblod/ember-rdfa-editor/core/keymap';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';

export default class TemplateCommentsPluginTemplateCommentComponent extends Component<EmberNodeArgs> {
  get outerView() {
    return this.args.view;
  }

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get selectionInside() {
    const { pos } = this.controller.mainEditorState.selection.$from;
    const startSelectionInsideNode =
      this.args.getPos() !== undefined &&
      pos > this.args.getPos() &&
      pos < this.args.getPos() + this.args.node.nodeSize;
    return startSelectionInsideNode;
  }

  get keymap() {
    const keymap = baseKeymap(this.schema);
    // bind ctrl+i to nothing, so it still gets catched by prosemirror
    // otherwise the browser will see this as a key pressed, which can be confusing for user.
    return {
      ...keymap,
      'Mod-i': () => true,
      'Mod-I': () => true,
    };
  }

  get plugins(): PluginConfig {
    return [
      inputRules({
        rules: [
          bullet_list_input_rule(this.schema.nodes.bullet_list),
          ordered_list_input_rule(this.schema.nodes.ordered_list),
        ],
      }),
    ];
  }
}
