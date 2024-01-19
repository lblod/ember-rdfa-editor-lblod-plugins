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
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';

export type CodelistInsertOptions = {
  publisher?: string;
  endpoint: string;
};

type Args = {
  controller: SayController;
  options: CodelistInsertOptions;
};

interface SelectStyle {
  label: string;
  value: string;
}

export default class CodelistInsertComponent extends Component<Args> {
  @service declare intl: IntlService;
  @tracked selectedCodelist?: CodeList;
  @tracked label?: string;
  @tracked selectedStyleValue = 'single';

  get controller() {
    return this.args.controller;
  }

  get documentLanguage() {
    return this.controller.documentLanguage;
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

  get selectionStyles() {
    const singleSelect = {
      label: this.intl.t('variable.codelist.single-select'),
      value: 'single',
    };
    const multiSelect = {
      label: this.intl.t('variable.codelist.multi-select'),
      value: 'multi',
    };
    return [singleSelect, multiSelect];
  }

  get selectedStyle() {
    return this.selectionStyles.find(
      (style) => style.value === this.selectedStyleValue,
    );
  }

  codelistData = trackedFunction(this, async () => {
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
    const codelistResource = this.selectedCodelist?.uri;
    const label =
      this.label ??
      this.selectedCodelist?.label ??
      this.intl.t('variable.codelist.label', {
        locale: this.documentLanguage,
      });
    const source = this.endpoint;
    const variableId = uuidv4();
    const node = this.schema.nodes.codelist.create(
      {
        selectionStyle: this.selectedStyleValue,
        subject: mappingResource,
        rdfaNodeType: 'resource',
        __rdfaId: variableId,
        properties: [
          {
            type: 'attribute',
            predicate: RDF('type').full,
            object: EXT('Mapping').full,
          },
          {
            type: 'attribute',
            predicate: EXT('instance').full,
            object: variableInstance,
          },
          {
            type: 'attribute',
            predicate: EXT('label').full,
            object: label,
          },
          {
            type: 'attribute',
            predicate: EXT('codelist').full,
            object: codelistResource,
          },
          {
            type: 'attribute',
            predicate: DCT('source').full,
            object: source,
          },
          {
            type: 'attribute',
            predicate: DCT('type').full,
            object: 'codelist',
          },
          {
            type: 'content',
            predicate: EXT('content').full,
          },
        ],
      },
      this.schema.node('placeholder', {
        placeholderText: this.selectedCodelist?.label,
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
  selectCodelist(codelist: CodeList) {
    this.selectedCodelist = codelist;
  }

  @action
  selectStyle(style: SelectStyle) {
    this.selectedStyleValue = style.value;
  }
}
