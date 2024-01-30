import Component from '@glimmer/component';
import {
  DecorationSource,
  NodeSelection,
  PNode,
  SayController,
  SayView,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';
import { service } from '@ember/service';
import {
  formatDate,
  validateDateFormat,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/date-helpers';
import { getParsedRDFAAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  contentDecorations?: DecorationSource;
};

export default class DateNodeviewComponent extends Component<Args> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  @action
  onClick() {
    const tr = this.args.controller.activeEditorState.tr;
    tr.setSelection(
      NodeSelection.create(
        this.args.controller.activeEditorState.doc,
        this.args.getPos() as number,
      ),
    );
    this.args.controller.activeEditorView.dispatch(tr);
  }

  get humanReadableDate() {
    const value = getParsedRDFAAttribute(this.args.node.attrs, EXT('content'))
      ?.object;
    const format = this.args.node.attrs.format as string;
    if (value) {
      if (validateDateFormat(format).type === 'ok') {
        return formatDate(new Date(value), format);
      } else {
        return 'Ongeldig formaat';
      }
    } else {
      return (this.args.node.attrs.onlyDate as boolean)
        ? this.intl.t('date-plugin.insert.date', {
            locale: this.documentLanguage,
          })
        : this.intl.t('date-plugin.insert.datetime', {
            locale: this.documentLanguage,
          });
    }
  }

  get label() {
    return getParsedRDFAAttribute(this.args.node.attrs, EXT('label'))?.object;
  }
}
