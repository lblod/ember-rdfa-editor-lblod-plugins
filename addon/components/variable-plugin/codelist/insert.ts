import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SayController } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  CodeList,
  fetchCodeListsByPublisher,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { trackedFunction } from 'reactiveweb/function';
import { v4 as uuidv4 } from 'uuid';
import {
  DCT,
  EXT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { replaceSelectionWithAndSelectNode } from '@lblod/ember-rdfa-editor-lblod-plugins/commands';

export type CodelistInsertOptions = {
  publisher?: string;
  endpoint: string;
};

type Args = {
  controller: SayController;
  options: CodelistInsertOptions;
  templateMode?: boolean;
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
    const mappingResource = `http://data.lblod.info/mappings/${
      this.args.templateMode ? '--ref-uuid4-' : ''
    }${uuidv4()}`;
    const variableInstance = `http://data.lblod.info/variables/${
      this.args.templateMode ? '--ref-uuid4-' : ''
    }${uuidv4()}`;
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
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(EXT('Mapping').full),
          },
          {
            predicate: EXT('instance').full,
            object: sayDataFactory.namedNode(variableInstance),
          },
          {
            predicate: EXT('label').full,
            object: sayDataFactory.literal(label),
          },
          {
            predicate: EXT('codelist').full,
            object: sayDataFactory.namedNode(codelistResource || ''),
          },
          {
            predicate: DCT('source').full,
            object: sayDataFactory.namedNode(source),
          },
          {
            predicate: DCT('type').full,
            object: sayDataFactory.literal('codelist'),
          },
          {
            predicate: EXT('content').full,
            object: sayDataFactory.contentLiteral(),
          },
        ],
      },
      this.schema.node('placeholder', {
        placeholderText: label,
      }),
    );

    this.label = undefined;
    this.controller.doCommand(replaceSelectionWithAndSelectNode(node), {
      view: this.controller.mainEditorView,
    });
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
