import Component from '@glimmer/component';
import { NodeSelection, ProsePlugin, SayView } from '@lblod/ember-rdfa-editor';
import { editableNodePlugin } from '@lblod/ember-rdfa-editor/plugins/editable-node';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

export default class LocationNodeViewComponent extends Component<EmberNodeArgs> {
  PencilIcon = PencilIcon;

  @tracked innerView?: SayView;

  get plugins(): ProsePlugin[] {
    return [editableNodePlugin(this.args.getPos)];
  }
  @action
  onClick() {
    if (this.innerView) {
      if (this.innerView.state.doc.firstChild?.type.name === 'placeholder') {
        this.innerView.focus();
        // Use request animation frame to only change the selection when the focus has been established
        window.requestAnimationFrame(() => {
          if (this.innerView) {
            const tr = this.innerView.state.tr;
            tr.setSelection(NodeSelection.create(this.innerView?.state.doc, 0));
            this.innerView?.dispatch(tr);
          }
        });
      } else {
        this.innerView.focus();
      }
    }
  }
  @action
  initEditor(view: SayView) {
    this.innerView = view;
  }

  get label() {
    return this.args.node.attrs.label as string;
  }
}
