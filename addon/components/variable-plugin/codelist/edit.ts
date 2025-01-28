import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  CodeListOptions,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { trackedFunction } from 'reactiveweb/function';
import { updateCodelistVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/codelist-utils';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { tracked } from '@glimmer/tracking';
export type CodelistEditOptions = {
  endpoint: string;
};
type Args = {
  controller: SayController;
  options: CodelistEditOptions;
};

export default class CodelistEditComponent extends Component<Args> {
  @tracked selectedCodelistOption?: CodeListOption | CodeListOption[];

  get controller() {
    return this.args.controller;
  }

  get selectedCodelist() {
    const { selection } = this.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.controller.schema.nodes.codelist
    ) {
      const codelist = {
        node: selection.node,
        pos: selection.from,
      };
      return codelist;
    }
    return;
  }

  get source() {
    if (this.selectedCodelist) {
      const { node } = this.selectedCodelist;
      const source = getOutgoingTriple(node.attrs, DCT('source'))?.object
        .value as Option<string>;
      if (source) {
        return source;
      }
    }
    return this.args.options.endpoint;
  }

  get codelistUri() {
    if (this.selectedCodelist) {
      const { node } = this.selectedCodelist;
      const codelistUri = getOutgoingTriple(node.attrs, EXT('codelist'))?.object
        .value as Option<string>;
      if (codelistUri) {
        return codelistUri;
      }
    }
    return;
  }

  get showCard() {
    return !!this.selectedCodelist;
  }

  get label() {
    return this.selectedCodelist?.node.attrs.label as string | undefined;
  }

  codelistOptions = trackedFunction(this, async () => {
    let result: CodeListOptions | undefined;
    if (this.source && this.codelistUri) {
      result = await fetchCodeListOptions(this.source, this.codelistUri);
    }
    this.selectedCodelistOption = undefined;
    return result;
  });

  get multiSelect() {
    const localStyle = this.selectedCodelist?.node.attrs
      .selectionStyle as string;
    if (localStyle) {
      return localStyle === 'multi';
    } else
      return this.codelistOptions.value?.type === MULTI_SELECT_CODELIST_TYPE;
  }

  @action
  insert() {
    if (!this.selectedCodelist || !this.selectedCodelistOption) {
      return;
    }
    updateCodelistVariable(
      this.selectedCodelist,
      this.selectedCodelistOption,
      this.controller,
    );
  }

  @action
  updateCodelistOption(codelistOption: CodeListOption | CodeListOption[]) {
    this.selectedCodelistOption = codelistOption;
  }
}
