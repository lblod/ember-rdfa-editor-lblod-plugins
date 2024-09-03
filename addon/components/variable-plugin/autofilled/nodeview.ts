import Component from '@glimmer/component';
import { NodeSelection, ProsePlugin, SayView, Transaction } from '@lblod/ember-rdfa-editor';
import { editableNodePlugin } from '@lblod/ember-rdfa-editor/plugins/editable-node';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';

import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { paragraph } from '@lblod/ember-rdfa-editor/nodes';

export default class AutoFilledVariableNodeViewComponent extends Component<EmberNodeArgs> {
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
    if (this.innerView?.state.doc.firstChild?.type.name !== 'placeholder') {
      return '';
    }
    return getOutgoingTriple(this.args.node.attrs, EXT('label'))?.object.value;
  }
  @action
  async didInsert() {
    const autofillKey = this.args.node.attrs.autofillKey;
    const autofilledValues = this.args.node.attrs.autofilledValues;
    const value = autofilledValues[autofillKey]
    console.log(this.args.node.attrs)
    console.log(autofillKey)
    console.log(autofilledValues)
    if(value) {
      console.log(value)
      const nodePos = this.args.getPos() as number;
      const nodeSize = this.args.node.nodeSize;
      const schema = this.args.controller.schema;
      const valueNode = schema.nodes.paragraph.create(
        {},
        schema.text(value),
      )
      console.log(this.args.node.attrs.convertToString)
      if(this.args.node.attrs.convertToString) {
        this.args.controller.withTransaction((tr: Transaction) => {
          tr.replaceRangeWith(nodePos, nodePos+nodeSize , valueNode)
          return tr;
        })
      } else {
        console.log('replacing inner')
        if(!this.innerView) return
        this.args.controller.withTransaction((tr: Transaction) => {
          tr.replaceRangeWith(0, this.innerView.state.doc.nodeSize - 1, valueNode)
          return tr;
        }, {view: this.innerView})
      }
    }
  }
}
