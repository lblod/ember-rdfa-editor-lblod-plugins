import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  CodeList,
  fetchCodeListsByPublisher,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { trackedFunction } from 'ember-resources/util/function';
import { v4 as uuidv4 } from 'uuid';

export type CodelistInsertOptions = {
  publisher?: string;
  endpoint: string;
};
type Args = {
  controller: SayController;
  options: CodelistInsertOptions;
};

export default class CodelistInsertComponent extends Component<Args> {
  @tracked selectedSubtype?: CodeList;
  @tracked label?: string;

  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get publisher() {
    return this.args.options.publisher;
  }

  get endpoint() {
    return this.args.options.endpoint;
  }

  subtypes = trackedFunction(this, async () => {
    return fetchCodeListsByPublisher(this.endpoint, this.publisher);
  });
  @action
  updateLabel(event: InputEvent) {
    this.label = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    const mappingResource = `http://data.lblod.info/mappings/${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
    const node = this.schema.nodes.codelist.create(
      {
        mappingResource,
        variableInstance,
        codelistResource: this.selectedSubtype?.uri,
        label: this.label ?? this.selectedSubtype?.label,
        source: this.endpoint,
      },
      this.schema.node('placeholder', {
        placeholderText: this.selectedSubtype?.label,
      }),
    );

    this.label = undefined;

    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );
  }

  @action
  updateSubtype(subtype: CodeList) {
    this.selectedSubtype = subtype;
  }
}