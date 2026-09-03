import Component from '@glimmer/component';
import FloatingWindow from '@lblod/ember-rdfa-editor/components/popover';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { DateEditComponent } from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/edit';
import { DateOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';

type Signature = {
  Args: {
    controller: SayController;
    options: DateOptions;
  };
  Blocks: {
    default: [];
  };
};

export default class FloatingDateContainer extends Component<Signature> {
  get editorState() {
    return this.args.controller.mainEditorState;
  }

  get selectedDateNode() {
    const { selection } = this.editorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === selection.node.type.schema.nodes['date']
    ) {
      return { value: selection.node, pos: selection.from };
    } else {
      return null;
    }
  }

  get forSelection() {
    if (!this.selectedDateNode) return null;

    return NodeSelection.create(
      this.editorState.doc,
      this.selectedDateNode.pos - 1,
    );
  }

  <template>
    {{#if this.forSelection}}
      <FloatingWindow
        @forSelection={{this.forSelection}}
        @controller={{@controller}}
        class='au-u-flex'
      >
        <DateEditComponent @controller={{@controller}} @options={{@options}} />
      </FloatingWindow>
    {{/if}}
  </template>
}
