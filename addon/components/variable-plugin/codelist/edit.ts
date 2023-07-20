import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeListOption,
  fetchCodeListOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { NodeSelection, ProseParser } from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import { trackedFunction } from 'ember-resources/util/function';
import { trackedReset } from 'tracked-toolbox';
export type CodeListEditOptions = {
  endpoint: string;
};
type Args = {
  controller: SayController;
  options: CodeListEditOptions;
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
    } else {
      return;
    }
  });

  get source() {
    return (
      (this.selectedCodelist.value?.node.attrs.source as string | undefined) ??
      this.args.options.endpoint
    );
  }

  get codelistUri() {
    return this.selectedCodelist.value?.node.attrs.codelistResource as
      | string
      | undefined;
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
    return this.codelistOptions.value?.type === MULTI_SELECT_CODELIST_TYPE;
  }

  @action
  insert() {
    if (!this.selectedCodelist.value || !this.selectedCodelistOption) {
      return;
    }
    let htmlToInsert: string;
    if (Array.isArray(this.selectedCodelistOption)) {
      htmlToInsert = this.selectedCodelistOption
        .map((option) => option.value)
        .join(', ');
    } else {
      htmlToInsert = unwrap(this.selectedCodelistOption.value);
    }
    htmlToInsert = this.wrapVariableInHighlight(htmlToInsert);
    const domParser = new DOMParser();
    const htmlNode = domParser.parseFromString(htmlToInsert, 'text/html');
    const contentFragment = ProseParser.fromSchema(
      this.args.controller.schema,
    ).parseSlice(htmlNode, {
      preserveWhitespace: false,
    }).content;
    const range = {
      from: this.selectedCodelist.value.pos + 1,
      to:
        this.selectedCodelist.value.pos +
        this.selectedCodelist.value.node.nodeSize -
        1,
    };
    this.controller.withTransaction(
      (tr) => {
        return tr.replaceWith(range.from, range.to, contentFragment);
      },
      { view: this.controller.mainEditorView },
    );
  }

  wrapVariableInHighlight(text: string) {
    return text.replace(
      /\$\{(.+?)\}/g,
      '<span class="mark-highlight-manual">${$1}</span>',
    );
  }

  @action
  updateCodelistOption(codelistOption: CodeListOption | CodeListOption[]) {
    this.selectedCodelistOption = codelistOption;
  }
}
