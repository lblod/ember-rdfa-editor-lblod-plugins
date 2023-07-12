import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  DEFAULT_VARIABLE_TYPES,
  VariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { CodeList } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { isNumber } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';

type Args = {
  controller: SayController;
  options: {
    publisher: string;
    variableTypes: (VariableType | string)[];
    defaultEndpoint: string;
  };
};

type minMaxObj = { minimumValue?: number; maximumValue?: number };
class ExtraAttributes {
  @tracked minimumValue = '';
  @tracked maximumValue = '';

  asObject(): minMaxObj {
    const obj: minMaxObj = {};
    if (isNumber(this.minimumValue)) {
      obj.minimumValue = Number(this.minimumValue);
    }
    if (isNumber(this.maximumValue)) {
      obj.maximumValue = Number(this.maximumValue);
    }
    return obj;
  }

  reset() {
    this.minimumValue = '';
    this.maximumValue = '';
  }
}

export default class EditorPluginsInsertCodelistCardComponent extends Component<Args> {
  @tracked variablesArray: VariableType[];
  @tracked selectedVariable?: VariableType;
  @tracked hasSubtype = false;
  @tracked selectedSubtype?: CodeList;
  @tracked subtypes?: CodeList[];
  @tracked variableLabel?: string;
  @tracked extraAttributes = new ExtraAttributes();
  publisher: string;
  endpoint: string;

  @service declare intl: IntlService;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    const { publisher, variableTypes, defaultEndpoint } =
      this.args.options || {};
    this.publisher = publisher;
    this.endpoint = defaultEndpoint;
    const variableTypesSelectedByUser = variableTypes ?? [
      'text',
      'number',
      'date',
      'location',
      'codelist',
    ];

    const variablesArray: VariableType[] = [];
    for (const type of variableTypesSelectedByUser) {
      if (typeof type === 'string') {
        const variableType = DEFAULT_VARIABLE_TYPES[type];
        if (variableType) {
          variablesArray.push(variableType);
        } else {
          console.warn(
            `Template Variable Plugin: variable type ${type} not found in the default variable types`
          );
        }
      } else {
        variablesArray.push(type);
      }
    }
    this.variablesArray = variablesArray;
  }

  get controller() {
    return this.args.controller;
  }

  get numberVariableError() {
    const minVal = this.extraAttributes.minimumValue;
    const maxVal = this.extraAttributes.maximumValue;
    if (
      isNumber(minVal) &&
      isNumber(maxVal) &&
      Number(minVal) > Number(maxVal)
    ) {
      return this.intl.t('variable.number.error-min-bigger-than-max');
    }

    return '';
  }

  @action
  updateVariableLabel(event: InputEvent) {
    this.variableLabel = (event.target as HTMLInputElement).value;
  }

  @action
  insert() {
    if (!this.selectedVariable || this.numberVariableError) {
      return;
    }

    const node = this.selectedVariable.constructor({
      schema: this.controller.schema,
      codelist: this.selectedSubtype,
      label: this.variableLabel !== '' ? this.variableLabel : undefined,
      attributes: {
        source: this.endpoint,
        ...this.extraAttributes.asObject(),
      },
    });

    this.variableLabel = '';
    this.extraAttributes.reset();

    this.controller.withTransaction(
      (tr) => {
        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView }
    );
  }

  @action
  updateSelectedVariable(variable: VariableType) {
    this.selectedVariable = variable;
    if (variable.fetchSubtypes) {
      void this.fetchSubtypes.perform(variable.fetchSubtypes);
      this.hasSubtype = true;
    } else {
      this.hasSubtype = false;
    }
  }

  fetchSubtypes = task(
    async (
      fetchFunction: (
        endpoint: string,
        publisher: string
      ) => Promise<CodeList[]>
    ) => {
      const subtypes = await fetchFunction(this.endpoint, this.publisher);
      this.subtypes = subtypes;
    }
  );

  @action
  updateSubtype(subtype: CodeList) {
    this.selectedSubtype = subtype;
    this.extraAttributes.reset();
  }

  get type() {
    return this.selectedVariable?.label;
  }

  get showCard() {
    if (this.args.controller.inEmbeddedView) {
      return false;
    }
    const { selection } = this.args.controller.mainEditorState;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.args.controller.schema.nodes.variable
    ) {
      return false;
    } else {
      const variable = findParentNodeOfType(
        this.args.controller.schema.nodes.variable
      )(selection);
      return !variable;
    }
  }
}
