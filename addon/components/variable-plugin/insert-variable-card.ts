import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import {
  DEFAULT_VARIABLE_TYPES,
  VariableType,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/constants';
import { CodeList } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/utils/fetch-data';
import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeSelection } from '@lblod/ember-rdfa-editor';
type Args = {
  controller: ProseController;
  widgetArgs: {
    options: {
      publisher: string;
      variableTypes: (VariableType | string)[];
      defaultEndpoint: string;
    };
  };
};

export default class EditorPluginsInsertCodelistCardComponent extends Component<Args> {
  @tracked variablesArray: VariableType[];
  @tracked selectedVariable?: VariableType;
  @tracked hasSubtype = false;
  @tracked selectedSubtype?: CodeList;
  @tracked subtypes?: CodeList[];
  publisher: string;
  endpoint: string;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    const { publisher, variableTypes, defaultEndpoint } =
      this.args.widgetArgs.options || {};
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

  @action
  insert() {
    if (!this.selectedVariable) {
      return;
    }
    const node = this.selectedVariable.constructor(
      this.args.controller.schema,
      this.endpoint,
      this.selectedSubtype
    );
    this.args.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(node);
    });
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
  }

  get showCard() {
    const { selection } = this.args.controller.state;
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
