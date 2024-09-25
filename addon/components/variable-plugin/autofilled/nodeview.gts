import Component from '@glimmer/component';
import {
  DecorationSet,
  NodeSelection,
  PNode,
  ProsePlugin,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import { editableNodePlugin } from '@lblod/ember-rdfa-editor/plugins/editable-node';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';

import {
  EmberNodeArgs,
  SayNodeViewConstructor,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { on } from '@ember/modifier';
import EmbeddedEditor from '@lblod/ember-rdfa-editor/components/ember-node/embedded-editor';

type Args = EmberNodeArgs & {
  getPos: () => number | undefined;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  selectNode: () => void;
  nodeViews: Record<string, SayNodeViewConstructor>;
};

export default class AutoFilledVariableNodeViewComponent extends Component<Args> {
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
  <template>
    <AuPill
      @icon={{this.PencilIcon}}
      @iconAlignment='right'
      class='variable'
      {{on 'click' this.onClick}}
    >
      <EmbeddedEditor
        @controller={{@controller}}
        @view={{@view}}
        @getPos={{@getPos}}
        @node={{@node}}
        @selected={{@selected}}
        @initEditor={{this.initEditor}}
        @nodeViews={{@nodeViews}}
        @plugins={{this.plugins}}
        @updateAttribute={{@updateAttribute}}
        @selectNode={{@selectNode}}
        @placeholder=''
        @contentDecorations={{@contentDecorations}}
      />
      {{#if this.label}}
        <span class='label'>
          ({{this.label}})
        </span>
      {{/if}}
    </AuPill>
  </template>
}
