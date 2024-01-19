import Component from '@glimmer/component';
import { action } from '@ember/object';
import { RdfaAttrs, SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { trackedFunction } from 'ember-resources/util/function';
import { trackedReset } from 'tracked-toolbox';
import { updateCodelistVariable } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/codelist-utils';
import { getParsedRDFAAttribute } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  DCT,
  EXT,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
export type CodelistEditOptions = {
  endpoint: string;
};
type Args = {
  controller: SayController;
  options: CodelistEditOptions;
};

export default class CodelistEditComponent extends Component<Args> {
  @trackedReset('codelistOptions.value') selectedCodelistOption?:
    | CodeListOption
    | CodeListOption[];

  get controller() {
    return this.args.controller;
  }

  selectedCodelist = trackedFunction(this, () => {
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
  });

  get source() {
    if (this.selectedCodelist.value) {
      const { node } = this.selectedCodelist.value;
      const source = getParsedRDFAAttribute(
        node.attrs as RdfaAttrs,
        DCT('source'),
      )?.object as Option<string>;
      if (source) {
        return source;
      }
    }
    return this.args.options.endpoint;
  }

  get codelistUri() {
    if (this.selectedCodelist.value) {
      const { node } = this.selectedCodelist.value;
      const codelistUri = getParsedRDFAAttribute(
        node.attrs as RdfaAttrs,
        EXT('codelist'),
      )?.object as Option<string>;
      if (codelistUri) {
        return codelistUri;
      }
    }
    return;
  }

  get showCard() {
    return !!this.selectedCodelist.value;
  }

  get label() {
    return this.selectedCodelist.value?.node.attrs.label as string | undefined;
  }

  codelistOptions = trackedFunction(this, async () => {
    if (this.source && this.codelistUri) {
      return fetchCodeListOptions(this.source, this.codelistUri);
    } else {
      return;
    }
  });

  get multiSelect() {
    const localStyle = this.selectedCodelist.value?.node.attrs
      .selectionStyle as string;
    if (localStyle) {
      return localStyle === 'multi';
    } else
      return this.codelistOptions.value?.type === MULTI_SELECT_CODELIST_TYPE;
  }

  @action
  insert() {
    if (!this.selectedCodelist.value || !this.selectedCodelistOption) {
      return;
    }
    updateCodelistVariable(
      this.selectedCodelist.value,
      this.selectedCodelistOption,
      this.controller,
    );
  }

  @action
  updateCodelistOption(codelistOption: CodeListOption | CodeListOption[]) {
    this.selectedCodelistOption = codelistOption;
  }
}
