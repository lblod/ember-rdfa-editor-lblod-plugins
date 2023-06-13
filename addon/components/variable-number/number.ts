import Component from '@glimmer/component';
import {
  DecorationSource,
  NodeSelection,
  PNode,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import intlService from 'ember-intl/services/intl';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localCopy } from 'tracked-toolbox';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  contentDecorations?: DecorationSource;
};
export default class VariableNumberPluginNumberComponent extends Component<Args> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @localCopy('args.node.attrs.value', '') declare inputNumber: string;
  @tracked errorMessage = '';
  @service declare intl: intlService;

  get node() {
    return this.args.node;
  }
  get formattedNumber() {
    return this.node.attrs.value as string;
  }

  get selected() {
    return this.args.selected;
  }

  @action onInputNumberChange(event: InputEvent) {
    this.inputNumber = (event.target as HTMLInputElement).value;
    this.validateAndSave();
  }

  validateAndSave() {
    if (!Number(this.inputNumber)) {
      this.errorMessage = this.intl.t('variable.number.error-not-number');
      return;
    }

    this.errorMessage = '';
    this.args.updateAttribute('value', this.inputNumber);
  }

  @action
  setSelected() {
    const tr = this.args.controller.activeEditorState.tr;
    tr.setSelection(
      NodeSelection.create(
        this.args.controller.activeEditorState.doc,
        this.args.getPos() as number
      )
    );
    this.args.controller.activeEditorView.dispatch(tr);
  }
}
