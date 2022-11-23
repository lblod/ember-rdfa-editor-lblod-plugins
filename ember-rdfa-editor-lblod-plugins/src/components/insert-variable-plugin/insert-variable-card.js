import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { v4 as uuidv4 } from 'uuid';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import { defaultVariableTypes } from '../../utils/variable-plugins/default-variable-types';

export default class EditorPluginsInsertCodelistCardComponent extends Component {
  @tracked variablesArray;
  @tracked selectedVariable;
  @tracked showCard = true;
  @tracked hasSubtype = false;
  @tracked selectedSubtype;
  @tracked subtypes;

  constructor() {
    super(...arguments);
    const { publisher, variableTypes, defaultEndpoint } =
      this.args.widgetArgs.options || {};
    this.publisher = publisher;
    this.endpoint = defaultEndpoint;
    let variableTypesSelectedByUser = variableTypes ?? [
      'text',
      'number',
      'date',
      'location',
      'codelist',
    ];

    const variablesArray = [];
    for (let type of variableTypesSelectedByUser) {
      if (typeof type === 'string') {
        const defaultVariable = defaultVariableTypes[type];
        if (defaultVariable) {
          variablesArray.push(defaultVariable);
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
    this.args.controller.onEvent('selectionChanged', this.selectionChanged);
  }

  @action
  insert() {
    const uri = `http://data.lblod.info/mappings/${uuidv4()}`;
    let variableContent;
    if (typeof this.selectedVariable.template === 'function') {
      variableContent = this.selectedVariable.template(
        this.endpoint,
        this.selectedSubtype
      );
    } else {
      variableContent = this.selectedVariable.template;
    }
    const htmlToInsert = `
      <span resource="${uri}" typeof="ext:Mapping">
        ${variableContent}
      </span>
    `;
    this.args.controller.executeCommand(
      'insert-html',
      htmlToInsert,
      this.args.controller.selection.lastRange
    );
    this.args.controller.executeCommand(
      'insert-text',
      INVISIBLE_SPACE,
      this.args.controller.selection.lastRange
    );
    this.selectedVariableType = undefined;
    this.selectedCodelist = undefined;
    this.isCodelist = false;
  }

  @action
  updateSelectedVariable(variable) {
    this.selectedVariable = variable;
    if (variable.fetchSubtypes) {
      this.fetchSubtypes.perform(variable.fetchSubtypes);
      this.hasSubtype = true;
    } else {
      this.hasSubtype = false;
    }
  }

  @task
  *fetchSubtypes(fetchFunction) {
    const subtypes = yield fetchFunction(this.endpoint, this.publisher);
    this.subtypes = subtypes;
  }

  @action
  updateSubtype(subtype) {
    this.selectedSubtype = subtype;
  }

  @action
  selectionChanged() {
    const currentSelection = this.args.controller.selection.lastRange;
    if (!currentSelection) {
      return;
    }
    this.showCard = false;
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      currentSelection,
      'rangeIsInside'
    );
    const mapping = limitedDatastore
      .match(null, 'a', 'ext:Mapping')
      .asQuads()
      .next().value;
    if (mapping) {
      this.showCard = false;
    } else {
      this.showCard = true;
    }
  }
}
