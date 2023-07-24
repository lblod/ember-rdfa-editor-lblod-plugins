import Component from '@glimmer/component';
import { PluginConfig, Schema, inputRules } from '@lblod/ember-rdfa-editor';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import {
  hard_break,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  bullet_list,
  bullet_list_input_rule,
  list_item,
  ordered_list,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list';
import {
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { baseKeymap } from '@lblod/ember-rdfa-editor/core/keymap';

export default class TemplateCommentsPluginTemplateCommentComponent extends Component<EmberNodeArgs> {
  get outerView() {
    return this.args.view;
  }

  get schema() {
    return new Schema({
      nodes: {
        doc: {
          content: 'block+',
        },
        paragraph,
        repaired_block,
        placeholder,

        text,

        hard_break,

        // currently a list_item can create an error when it is in an embedded editor
        list_item,
        ordered_list,
        bullet_list,
      },
      marks: {
        strong,
        underline,
        strikethrough,
      },
    });
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
