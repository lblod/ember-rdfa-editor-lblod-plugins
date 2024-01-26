import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import {
  NodeSelection,
  PNode,
  RdfaAttrs,
  SayController,
} from '@lblod/ember-rdfa-editor';
import { Address } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/address';
import { getParsedRDFAAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

type Args = {
  getPos: () => number | undefined;
  node: PNode;
  controller: SayController;
};

export default class AddressNodeviewComponent extends Component<Args> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
  }

  get translations() {
    return {
      placeholder: this.intl.t('editor-plugins.address.nodeview.placeholder', {
        locale: this.documentLanguage,
      }),
    };
  }

  get node() {
    return this.args.node;
  }

  get address() {
    return this.node.attrs.value as Address | null;
  }

  get label() {
    return getParsedRDFAAttribute(this.node.attrs as RdfaAttrs, EXT('label'))
      ?.object;
  }

  @action
  selectThisNode() {
    const tr = this.args.controller.activeEditorState.tr;
    tr.setSelection(
      NodeSelection.create(
        this.args.controller.activeEditorState.doc,
        this.args.getPos() as number,
      ),
    );
    this.args.controller.activeEditorView.dispatch(tr);
  }
}
