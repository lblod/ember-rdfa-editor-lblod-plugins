import Component from '@glimmer/component';
import { PluginConfig, inputRules } from '@lblod/ember-rdfa-editor';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  bullet_list_input_rule,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { baseKeymap } from '@lblod/ember-rdfa-editor/core/keymap';

export default class TemplateCommentsPluginTemplateCommentComponent extends Component<EmberNodeArgs> {
  get outerView() {
    return this.args.view;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get keymap() {
    const keymap = baseKeymap(this.schema, {
      embeddedConfig: {
        state: this.outerView.state,
        dispatch: this.outerView.dispatch.bind(this),
      },
    });
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
