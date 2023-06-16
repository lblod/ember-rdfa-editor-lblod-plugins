import Component from '@glimmer/component';
import {
  DecorationSource,
  NodeSelection,
  PNode,
  SayController,
  SayView,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import intlService from 'ember-intl/services/intl';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localCopy } from 'tracked-toolbox';
import {
  MAXIMUM_VALUE_PNODE_KEY,
  MINIMUM_VALUE_PNODE_KEY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { isBlank } from '@ember/utils';

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
  cursorPositionKeyDown: number | null = null;

  focus(element: HTMLInputElement) {
    element.focus();
  }

  get node() {
    return this.args.node;
  }
  get formattedNumber() {
    return this.node.attrs.value as string;
  }

  get selected() {
    return this.args.selected;
  }

  get minValue() {
    return this.node.attrs[MINIMUM_VALUE_PNODE_KEY] as number;
  }

  get maxValue() {
    return this.node.attrs[MAXIMUM_VALUE_PNODE_KEY] as number;
  }

  @action onInputNumberChange(event: InputEvent) {
    this.inputNumber = (event.target as HTMLInputElement).value;
    this.validateAndSave();
  }

  validateAndSave() {
    if (isBlank(this.inputNumber)) {
      this.errorMessage = '';
      this.args.updateAttribute('value', '');
      return;
    }

    const number = Number(this.inputNumber);
    if (Number.isNaN(number)) {
      this.errorMessage = this.intl.t('variable.number.error-not-number');
      return;
    }
    const validMinimum = !this.minValue || number >= this.minValue;
    const validMaximum = !this.maxValue || number <= this.maxValue;

    if (!validMinimum || !validMaximum) {
      if (this.minValue && this.maxValue) {
        this.errorMessage = this.intl.t(
          'variable.number.error-number-between',
          { minValue: this.minValue, maxValue: this.maxValue }
        );
      } else if (this.minValue) {
        this.errorMessage = this.intl.t('variable.number.error-number-above', {
          minValue: this.minValue,
        });
      } else if (this.maxValue) {
        this.errorMessage = this.intl.t('variable.number.error-number-below', {
          maxValue: this.maxValue,
        });
      }
      return;
    }

    this.errorMessage = '';
    this.args.updateAttribute('value', this.inputNumber);
  }

  @action
  selectThisNode() {
    const tr = this.args.controller.activeEditorState.tr;
    tr.setSelection(
      NodeSelection.create(
        this.args.controller.activeEditorState.doc,
        this.args.getPos() as number
      )
    );
    this.args.controller.activeEditorView.dispatch(tr);
  }

  @action
  leaveOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.selectAfterNode();
    }
  }

  @action setPosBeforeKeypress(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      this.cursorPositionKeyDown = (
        event.target as HTMLInputElement
      ).selectionStart;
    }
  }
  @action leaveWithArrows(event: KeyboardEvent) {
    const finalPos = (event.target as HTMLInputElement).value.length;
    if (event.key === 'ArrowRight' && this.cursorPositionKeyDown === finalPos) {
      this.selectAfterNode();
    }
    if (event.key === 'ArrowLeft' && this.cursorPositionKeyDown === 0) {
      this.selectBeforeNode();
    }
    this.cursorPositionKeyDown = null;
  }

  setSelectionAt(pos: number) {
    const tr = this.args.controller.activeEditorState.tr;
    tr.setSelection(
      TextSelection.create(this.args.controller.activeEditorState.doc, pos)
    );
    this.args.controller.focus();
    this.args.controller.activeEditorView.dispatch(tr);
  }

  selectAfterNode() {
    this.setSelectionAt(
      (this.args.getPos() as number) + this.args.node.nodeSize
    );
  }

  selectBeforeNode() {
    this.setSelectionAt(this.args.getPos() as number);
  }
}
